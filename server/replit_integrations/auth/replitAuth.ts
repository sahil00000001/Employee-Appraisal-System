import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { db } from "../../db";
import { otpCodes, employees } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateOTP, sendOTPEmail } from "../../email";

// Simple in-memory rate limiting for manager login
const managerLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.insert(otpCodes).values({
        email: email.toLowerCase(),
        code: otp,
        expiresAt,
      });

      const sent = await sendOTPEmail(email, otp);
      
      if (!sent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }

      res.json({ message: "Verification code sent", email: email.toLowerCase() });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }

      const now = new Date();
      const [validOtp] = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.email, email.toLowerCase()),
            eq(otpCodes.code, code),
            eq(otpCodes.used, "false"),
            gt(otpCodes.expiresAt, now)
          )
        )
        .limit(1);

      if (!validOtp) {
        return res.status(401).json({ message: "Invalid or expired verification code" });
      }

      await db
        .update(otpCodes)
        .set({ used: "true" })
        .where(eq(otpCodes.id, validOtp.id));

      let user = await authStorage.getUserByEmail(email.toLowerCase());
      
      if (!user) {
        user = await authStorage.upsertUser({
          email: email.toLowerCase(),
          firstName: email.split("@")[0],
          lastName: "",
        });
      }

      // Auto-link employee record to this user by email
      await db
        .update(employees)
        .set({ userId: user!.id })
        .where(eq(employees.email, email.toLowerCase()));

      (req.session as any).user = {
        claims: {
          sub: user!.id,
          email: user!.email,
          first_name: user!.firstName,
          last_name: user!.lastName,
        },
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      res.json({ 
        message: "Login successful", 
        user: {
          id: user!.id,
          email: user!.email,
          firstName: user!.firstName,
          lastName: user!.lastName,
        }
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  app.post("/api/auth/manager-login", async (req, res) => {
    try {
      const { managerId, password } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      
      // Rate limiting check
      const attempts = managerLoginAttempts.get(clientIp);
      if (attempts) {
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
        if (attempts.count >= MAX_ATTEMPTS && timeSinceLastAttempt < LOCKOUT_TIME) {
          const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
          return res.status(429).json({ 
            message: `Too many login attempts. Please try again in ${remainingTime} minutes.` 
          });
        }
        // Reset if lockout time has passed
        if (timeSinceLastAttempt >= LOCKOUT_TIME) {
          managerLoginAttempts.delete(clientIp);
        }
      }
      
      if (!managerId || !password) {
        return res.status(400).json({ message: "Manager ID and password are required" });
      }

      // Default manager credentials: manager/manager
      if (managerId !== "manager" || password !== "manager") {
        // Track failed attempt
        const current = managerLoginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };
        managerLoginAttempts.set(clientIp, { 
          count: current.count + 1, 
          lastAttempt: Date.now() 
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Clear failed attempts on successful login
      managerLoginAttempts.delete(clientIp);

      // Create a separate manager session (distinct from employee sessions)
      (req.session as any).managerUser = {
        claims: {
          sub: "manager-admin",
          email: "manager@360feedback.com",
          first_name: "Manager",
          last_name: "Admin",
          isManagerSession: true,
        },
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      res.json({ 
        message: "Login successful",
        user: {
          id: "manager-admin",
          email: "manager@360feedback.com",
          firstName: "Manager",
          lastName: "Admin",
          isManagerSession: true,
        }
      });
    } catch (error) {
      console.error("Error in manager login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/manager-status", (req, res) => {
    const managerUser = (req.session as any)?.managerUser;
    if (!managerUser || !managerUser.expires_at) {
      return res.status(401).json({ authenticated: false });
    }
    const now = Math.floor(Date.now() / 1000);
    if (now > managerUser.expires_at) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ 
      authenticated: true, 
      user: {
        id: managerUser.claims.sub,
        email: managerUser.claims.email,
        firstName: managerUser.claims.first_name,
        lastName: managerUser.claims.last_name,
      }
    });
  });

  // Manager-specific logout that only clears manager session
  app.get("/api/auth/manager-logout", (req, res) => {
    if ((req.session as any)?.managerUser) {
      delete (req.session as any).managerUser;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session after manager logout:", err);
        }
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  });

  // General logout (clears entire session)
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any)?.user;

  if (!sessionUser || !sessionUser.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > sessionUser.expires_at) {
    return res.status(401).json({ message: "Session expired" });
  }

  (req as any).user = sessionUser;
  return next();
};
