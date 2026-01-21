import { db } from "./db";
import { employees } from "@shared/schema";
import { eq } from "drizzle-orm";

const employeeData = [
  { "fullName": "Muralidharan D", "designation": "Business Analyst", "department": "Software Development (India)", "emailAddress": "muralidharan@podtech.com", "reportingManager": "Sunandan Handoo" },
  { "fullName": "Shreya Jain", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "shreya.jain@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Shivam Patel", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "shivam.patel@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Gaurav Sharma", "designation": "Software Engineer Manager", "department": "Software Development (India)", "emailAddress": "gaurav.sharma@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Pragati Naik", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "pragati.naik@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Adam Trach", "designation": "Junior Software Developer", "department": "Software Development (UK)", "emailAddress": "adam@podtech.com", "reportingManager": "Ajeet Mishra" },
  { "fullName": "Rohan D J", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "rohan.dj@podtech.com", "reportingManager": "Deepak Padukone Manjunath" },
  { "fullName": "Callum Wild", "designation": "Intern", "department": "Software Development (UK)", "emailAddress": "callum@podtech.com", "reportingManager": "Mark David Page" },
  { "fullName": "Nathan Cherry", "designation": "Intern", "department": "Software Development (UK)", "emailAddress": "nathan@podtech.com", "reportingManager": "Mark David Page" },
  { "fullName": "Mohammed Afaq", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "mohammed.afaq@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "B S Saanvi", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "bs.saanvi@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Prachi Sinha", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "prachi.sinha@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Abhishek P", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "abhishek.p@podtech.com", "reportingManager": "Sunandan Handoo" },
  { "fullName": "Deepak Padukone Manjunath", "designation": "Technical Lead", "department": "Software Development (India)", "emailAddress": "deepak@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Vandana Pathak", "designation": "Intern", "department": "HR (India)", "emailAddress": "vandana@podtech.com", "reportingManager": "Shweta Barmi" },
  { "fullName": "Utkarsh Pal", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "utkarsh.pal@podtech.com", "reportingManager": "Rishi Kumar" },
  { "fullName": "Aditya Soni", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "aditya.soni@podtech.com", "reportingManager": "Deepak Padukone Manjunath" },
  { "fullName": "Mimansa .", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "mimansa.jha@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Dikshant Singh", "designation": "Business Analyst", "department": "Software Development (India)", "emailAddress": "dikshant.singh@podtech.com", "reportingManager": "Sunandan Handoo" },
  { "fullName": "Shakti Mohan", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "shakthi.mohan@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Rishika Jha", "designation": "Intern", "department": "Software Development (India)", "emailAddress": "rishika.jha@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Ashish Singh", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "ashish.singh@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Avantika Upadhyay", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "avantika@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Dharmendra SIngh Yadav", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "dharmendra.yadav@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Sahil Vashisht", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "sahil.vashisht@podtech.com", "reportingManager": "Deepak Padukone Manjunath" },
  { "fullName": "Mohit Yadav", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "mohit.yadav@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Mukesh Goswami", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "mukesh.goswami@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Karan Bandekar", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "karan.bandekar@podtech.com", "reportingManager": "Deepak Padukone Manjunath" },
  { "fullName": "Vipin Mehta", "designation": "Head of Delivery and Operations", "department": "Software Development (India)", "emailAddress": "vipin@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Nisha Rani", "designation": "Data Analyst", "department": "Software Development (India)", "emailAddress": "nisha.rani@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Akash Yadav", "designation": "QA Engineer (Manual+Automation)", "department": "Software Development (India)", "emailAddress": "akash.yadav@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Aditi Verma", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "aditi.verma@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Megha Jain", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "megha.jain@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Abhishek Kumar Gautam", "designation": "Database Administrator (DBA)", "department": "Software Development (India)", "emailAddress": "abhishek@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Shrishti Ravindra Singh", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "shrishti.singh@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Shubham Sharma", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "shubham.sharma@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Sunandan Handoo", "designation": "Scrum Master", "department": "Software Development (India)", "emailAddress": "sunandan.handoo@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Abbaas Ibn - Zubair", "designation": "Junior DevOps Engineer", "department": "Software Development (UK)", "emailAddress": "abbaas@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Keith Drewrey", "designation": "Junior Software Developer", "department": "Software Development (UK)", "emailAddress": "keith@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Naini Yadav", "designation": "Senior Software Developer", "department": "Software Development (India)", "emailAddress": "naini.yadav@podtech.com", "reportingManager": "Deepak Padukone Manjunath" },
  { "fullName": "Sanjay Kumar Ranjan", "designation": "Sr. DevOps Engineer", "department": "Software Development (India)", "emailAddress": "sanjay.ranjan@podtech.com", "reportingManager": "Rishi Kumar" },
  { "fullName": "Shempy Tamrakar", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "shempy.tamrakar@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Shivam Middha", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "shivam.middha@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Mark David Page", "designation": "HSE Product Owner", "department": "Software Development (UK)", "emailAddress": "mark@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Shivani Singh", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "shivani.singh@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Amit Sharma", "designation": "QA Engineer (Manual)", "department": "Software Development (India)", "emailAddress": "amit.sharma@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Sonakshi Jha", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "sonakshi.jha@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Dhawal Jain", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "dhawal.jain@podtech.com", "reportingManager": "Anuj Kumar" },
  { "fullName": "Daisy Rani", "designation": "Senior Software Developer", "department": "Software Development (UK)", "emailAddress": "daisy@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Tushar Jha", "designation": "Senior Software Developer", "department": "Software Development (India)", "emailAddress": "ravi.jha@podtech.com", "reportingManager": "Prem Narayan Jha" },
  { "fullName": "Susil Kumar Sahu", "designation": "Quality Assurance (QA) Automation Engineer", "department": "Software Development (India)", "emailAddress": "susil@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Vaibhav Kumar Singh", "designation": "QA Engineer (Manual+Automation)", "department": "Software Development (India)", "emailAddress": "vaibhav.singh@podtech.com", "reportingManager": "Rajeev Bansal" },
  { "fullName": "Anuj Kumar", "designation": "Senior Tech Lead", "department": "Software Development (India)", "emailAddress": "anuj@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Rohit Prakash", "designation": "Release Architect", "department": "Software Development (India)", "emailAddress": "rohit@podtech.com", "reportingManager": "Rishi Kumar" },
  { "fullName": "Rishabh Kumar", "designation": "UI/UX Designer", "department": "Software Development (India)", "emailAddress": "rishabh@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Aman Kashyap", "designation": "UI/UX Designer", "department": "Software Development (India)", "emailAddress": "aman@podtech.com", "reportingManager": "Deepak Padukone Manjunath" },
  { "fullName": "Rishi Kumar", "designation": "Senior DevOps Engineer", "department": "Software Development (India)", "emailAddress": "rishi@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Dev Sharma", "designation": "Software Developer", "department": "Software Development (India)", "emailAddress": "dev@podtech.com", "reportingManager": "Daisy Rani" },
  { "fullName": "Rajeev Bansal", "designation": "Technical Project Manager", "department": "Software Development (India)", "emailAddress": "rajeev@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Prem Narayan Jha", "designation": "Senior Software Developer", "department": "Software Development (India)", "emailAddress": "prem@podtech.com", "reportingManager": "Vipin Mehta" },
  { "fullName": "Anastasia Podciborski", "designation": "Director", "department": "HR (UK)", "emailAddress": "anastasia@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Ajeet Mishra", "designation": "Technical Project Manager", "department": "Software Development (UK)", "emailAddress": "ajeet@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Vaibhav Goel", "designation": "Software Developer", "department": "Software Development (UK)", "emailAddress": "vaibhav@podtech.com", "reportingManager": "Ajeet Mishra" },
  { "fullName": "Christopher Lee", "designation": "Software Developer", "department": "Software Development (UK)", "emailAddress": "chris@podtech.com", "reportingManager": "Ajeet Mishra" },
  { "fullName": "Chris Mok", "designation": "Software Developer", "department": "Software Development (UK)", "emailAddress": "chrismok@podtech.com", "reportingManager": "Ajeet Mishra" },
  { "fullName": "Shweta Barmi", "designation": "HR Manager", "department": "HR (India)", "emailAddress": "shweta@podtech.com", "reportingManager": "Harry Pod" },
  { "fullName": "Harry Pod", "designation": "Director", "department": "HR (UK)", "emailAddress": "harry@podtech.com", "reportingManager": "" }
];

function determineRole(designation: string): "employee" | "manager" | "lead" {
  const leadDesignations = [
    "Director",
    "Head of Delivery and Operations",
    "Technical Project Manager",
    "Scrum Master",
    "Technical Lead",
    "Senior Tech Lead",
    "HSE Product Owner",
    "HR Manager",
    "Software Engineer Manager"
  ];
  
  const managerDesignations = [
    "Senior Software Developer",
    "Senior DevOps Engineer",
    "Release Architect"
  ];
  
  if (leadDesignations.some(d => designation.toLowerCase().includes(d.toLowerCase()))) {
    return "lead";
  }
  
  if (managerDesignations.some(d => designation.toLowerCase().includes(d.toLowerCase()))) {
    return "manager";
  }
  
  return "employee";
}

async function seedEmployees() {
  console.log("Starting employee seeding...");
  
  const existingEmployees = await db.select().from(employees);
  if (existingEmployees.length > 0) {
    console.log(`Found ${existingEmployees.length} existing employees. Clearing...`);
    await db.delete(employees);
  }
  
  const emailToId: Record<string, string> = {};
  const nameToEmail: Record<string, string> = {};
  
  for (const emp of employeeData) {
    nameToEmail[emp.fullName] = emp.emailAddress;
  }
  
  console.log(`Inserting ${employeeData.length} employees...`);
  for (const emp of employeeData) {
    const role = determineRole(emp.designation);
    const userId = `user-${emp.emailAddress.split("@")[0]}`;
    
    const [inserted] = await db.insert(employees).values({
      userId,
      name: emp.fullName,
      email: emp.emailAddress,
      role,
      designation: emp.designation,
      department: emp.department,
    }).returning();
    
    emailToId[emp.emailAddress] = inserted.id;
  }
  
  console.log("Setting up manager relationships...");
  for (const emp of employeeData) {
    if (!emp.reportingManager) continue;
    
    const managerEmail = nameToEmail[emp.reportingManager];
    if (!managerEmail) {
      console.log(`Warning: Manager "${emp.reportingManager}" not found for ${emp.fullName}`);
      continue;
    }
    
    const employeeId = emailToId[emp.emailAddress];
    const managerId = emailToId[managerEmail];
    
    if (employeeId && managerId) {
      await db.update(employees)
        .set({ managerId })
        .where(eq(employees.id, employeeId));
    }
  }
  
  const count = await db.select().from(employees);
  console.log(`Successfully seeded ${count.length} employees with reporting relationships!`);
  
  const leads = count.filter(e => e.role === "lead");
  const managers = count.filter(e => e.role === "manager");
  const regularEmployees = count.filter(e => e.role === "employee");
  
  console.log(`\nRole breakdown:`);
  console.log(`- Leads: ${leads.length}`);
  console.log(`- Managers: ${managers.length}`);
  console.log(`- Employees: ${regularEmployees.length}`);
}

seedEmployees()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
