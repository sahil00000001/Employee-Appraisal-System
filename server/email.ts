import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - 360 Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="M18 17V9"/>
                        <path d="M13 17V5"/>
                        <path d="M8 17v-3"/>
                      </svg>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                      360 Feedback
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      Performance Review System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                Verify Your Identity
              </h2>
              <p style="margin: 0 0 32px 0; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                Enter this verification code to sign in to your account. This code expires in 10 minutes.
              </p>
              
              <!-- OTP Code Box -->
              <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">
                  Your Verification Code
                </p>
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1d4ed8; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                  <strong>Security Tip:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                </p>
              </div>
              
              <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.6;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                      This email was sent by <strong>360 Feedback</strong>
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      © 2025 360 Feedback. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Additional Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 24px auto 0;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You're receiving this email because you requested to sign in to 360 Feedback.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
360 Feedback - Verification Code

Your verification code is: ${otp}

This code expires in 10 minutes.

Security Tip: Never share this code with anyone. Our team will never ask for your verification code.

If you didn't request this code, you can safely ignore this email.

© 2025 360 Feedback. All rights reserved.
  `;

  try {
    await transporter.sendMail({
      from: `"360 Feedback" <${process.env.OUTLOOK_EMAIL}>`,
      to,
      subject: `${otp} is your 360 Feedback verification code`,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export async function sendFeedbackAssignmentEmail(
  to: string, 
  reviewerName: string,
  targetEmployeeName: string
): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Request - 360 Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="M18 17V9"/>
                        <path d="M13 17V5"/>
                        <path d="M8 17v-3"/>
                      </svg>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                      360 Feedback
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      Performance Review System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                Feedback Request Assigned
              </h2>
              <p style="margin: 0 0 24px 0; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                Hello ${reviewerName},
              </p>
              
              <!-- Assignment Box -->
              <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">
                  You have been assigned to provide feedback for
                </p>
                <div style="font-size: 24px; font-weight: 700; color: #1d4ed8; margin-top: 12px;">
                  ${targetEmployeeName}
                </div>
              </div>
              
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6; text-align: center;">
                Please log in to 360 Feedback to complete your peer review. Your honest and constructive feedback helps your colleague grow professionally.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://360feedback.replit.app'}/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Submit Your Feedback
                </a>
              </div>
              
              <!-- Tips -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px;">
                <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                  <strong>Tips for good feedback:</strong> Be specific, focus on behaviors and outcomes, and provide examples where possible.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                      This email was sent by <strong>360 Feedback</strong>
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      © 2025 360 Feedback. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
360 Feedback - Feedback Request Assigned

Hello ${reviewerName},

You have been assigned to provide feedback for: ${targetEmployeeName}

Please log in to 360 Feedback to complete your peer review. Your honest and constructive feedback helps your colleague grow professionally.

Tips for good feedback: Be specific, focus on behaviors and outcomes, and provide examples where possible.

© 2025 360 Feedback. All rights reserved.
  `;

  try {
    await transporter.sendMail({
      from: `"360 Feedback" <${process.env.OUTLOOK_EMAIL}>`,
      to,
      subject: `Action Required: Provide feedback for ${targetEmployeeName}`,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send feedback assignment email:", error);
    return false;
  }
}
