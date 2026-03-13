export const DEPARTMENT_DATA = [
  {
    id: "DEP001", name: "Human Resources", shortName: "HR",
    description: "Handles recruitment, employee relations, payroll, and company policies",
    head: "HR Manager",
    roles: ["HR Director", "HR Manager", "HR Business Partner", "Talent Acquisition Manager", "Recruiter", "HR Executive", "Payroll Specialist", "HR Coordinator"]
  },
  {
    id: "DEP002", name: "Software Development", shortName: "DEV",
    description: "Develops and maintains software applications",
    head: "Engineering Manager",
    roles: ["Chief Technology Officer", "Engineering Manager", "Technical Lead", "Senior Software Engineer", "Software Engineer", "Junior Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer", "Software Architect", "Intern Developer"]
  },
  {
    id: "DEP003", name: "Quality Assurance", shortName: "QA",
    description: "Tests software to ensure quality and reliability",
    head: "QA Manager",
    roles: ["QA Director", "QA Manager", "QA Lead", "Senior QA Engineer", "QA Engineer", "Automation Test Engineer", "Manual Tester", "Performance Test Engineer", "QA Intern"]
  },
  {
    id: "DEP004", name: "Product Management", shortName: "PM",
    description: "Defines product vision, roadmap, and requirements",
    head: "Product Manager",
    roles: ["Chief Product Officer", "Product Director", "Product Manager", "Associate Product Manager", "Product Owner", "Product Analyst", "Product Intern"]
  },
  {
    id: "DEP005", name: "UI/UX Design", shortName: "DESIGN",
    description: "Designs user interfaces and user experience",
    head: "Design Lead",
    roles: ["Design Director", "UX Manager", "UI/UX Lead", "Senior UI Designer", "UX Designer", "UI Designer", "Graphic Designer", "Interaction Designer", "Design Intern"]
  },
  {
    id: "DEP006", name: "DevOps", shortName: "DEVOPS",
    description: "Manages deployment, infrastructure, and CI/CD pipelines",
    head: "DevOps Manager",
    roles: ["DevOps Director", "DevOps Manager", "DevOps Lead", "Site Reliability Engineer", "Cloud Engineer", "Infrastructure Engineer", "Release Manager", "DevOps Engineer", "DevOps Intern"]
  },
  {
    id: "DEP007", name: "IT Support", shortName: "IT",
    description: "Handles internal technical support and infrastructure",
    head: "IT Manager",
    roles: ["IT Director", "IT Manager", "System Administrator", "Network Engineer", "IT Support Specialist", "Help Desk Technician", "Technical Support Engineer", "IT Intern"]
  },
  {
    id: "DEP008", name: "Sales", shortName: "SALES",
    description: "Responsible for selling company products and services",
    head: "Sales Director",
    roles: ["Sales Director", "Sales Manager", "Business Development Manager", "Account Manager", "Sales Executive", "Sales Representative", "Inside Sales Executive", "Sales Intern"]
  },
  {
    id: "DEP009", name: "Marketing", shortName: "MKT",
    description: "Handles promotions, branding, and market campaigns",
    head: "Marketing Manager",
    roles: ["Marketing Director", "Marketing Manager", "Digital Marketing Manager", "SEO Specialist", "Content Marketing Manager", "Social Media Manager", "Marketing Executive", "Brand Manager", "Marketing Intern"]
  },
  {
    id: "DEP010", name: "Finance", shortName: "FIN",
    description: "Manages company finances, accounting, and budgeting",
    head: "Finance Manager",
    roles: ["Chief Financial Officer", "Finance Director", "Finance Manager", "Accountant", "Financial Analyst", "Accounts Executive", "Payroll Accountant", "Finance Intern"]
  },
  {
    id: "DEP011", name: "Legal", shortName: "LEGAL",
    description: "Handles legal matters and compliance",
    head: "Legal Advisor",
    roles: ["Legal Director", "Legal Manager", "Corporate Lawyer", "Compliance Officer", "Legal Advisor", "Legal Executive", "Legal Intern"]
  },
  {
    id: "DEP012", name: "Customer Support", shortName: "SUPPORT",
    description: "Provides assistance to customers and resolves issues",
    head: "Support Manager",
    roles: ["Support Director", "Customer Support Manager", "Support Team Lead", "Customer Success Manager", "Customer Support Executive", "Technical Support Engineer", "Helpdesk Agent", "Support Intern"]
  },
  {
    id: "DEP013", name: "Research and Development", shortName: "R&D",
    description: "Innovates and researches new technologies",
    head: "R&D Director",
    roles: ["R&D Director", "Research Manager", "Senior Research Engineer", "Research Engineer", "Innovation Specialist", "Data Scientist", "AI Engineer", "Research Intern"]
  },
  {
    id: "DEP014", name: "Administration", shortName: "ADMIN",
    description: "Manages office operations and facilities",
    head: "Admin Manager",
    roles: ["Admin Director", "Admin Manager", "Office Manager", "Facility Manager", "Administrative Assistant", "Office Executive", "Receptionist", "Admin Intern"]
  },
];

// ✅ Helper: get all department names for dropdown
export const DEPARTMENT_NAMES = DEPARTMENT_DATA.map(d => d.name);

// ✅ Helper: get roles for a specific department name
export const getRolesByDepartment = (deptName: string): string[] => {
  const dept = DEPARTMENT_DATA.find(d => d.name === deptName);
  return dept?.roles ?? [];
};