import { getDatabase } from '../lib/database';

// // Clear existing jobs first
// const db = getDatabase();
// db.prepare('DELETE FROM jobs').run();
// const stmt = db.prepare(`
//   INSERT INTO jobs (
//     title, description, location, company, department, seniority_level,
//     required_skills, preferred_skills, salary_min, salary_max,
//     employment_type, remote_eligible
//   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
// `);

// const companies = ['TechFlow Inc', 'InnovateLabs', 'DataCorp Solutions', 'CloudFirst Technologies', 'DevStream Inc'];
// const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'];
// const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
// const seniorityLevels = ['junior', 'mid', 'senior', 'lead'];
// const jobTitles = [
//   'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
//   'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer',
//   'Marketing Manager', 'Sales Representative', 'QA Engineer', 'Technical Lead'
// ];

// for (let i = 0; i < 100; i++) {
//   const title = `${jobTitles[i % jobTitles.length]} ${i + 1}`;
//   const company = companies[i % companies.length];
//   const location = locations[i % locations.length];
//   const department = departments[i % departments.length];
//   const seniority = seniorityLevels[i % seniorityLevels.length];
  
//   stmt.run(
//     title,
//     `Exciting opportunity for a ${title} at ${company}. Join our team to work on cutting-edge projects and grow your career.`,
//     location,
//     company,
//     department,
//     seniority,
//     JSON.stringify(["JavaScript", "SQL", "Git", "Agile"]),
//     JSON.stringify(["React", "Python", "AWS", "Docker"]),
//     60000 + i * 1000,
//     80000 + i * 1000,
//     'full-time',
//     i % 3 === 0 ? 1 : 0
//   );
// }

// console.log('Database populated with 100 synthetic job listings');

const db = getDatabase();
db.prepare('DELETE FROM jobs').run();

const stmt = db.prepare(`
  INSERT INTO jobs (
    title, description, full_description, location, company, department, seniority_level,
    required_skills, preferred_skills, salary_min, salary_max,
    employment_type, remote_eligible, full_description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const companies = ['TechFlow Inc', 'InnovateLabs', 'DataCorp Solutions', 'CloudFirst Technologies', 'DevStream Inc'];
const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'];
const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
const seniorityLevels = ['junior', 'mid', 'senior', 'lead'];
const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer',
  'Marketing Manager', 'Sales Representative', 'QA Engineer', 'Technical Lead'
];

for (let i = 0; i < 100; i++) {
  const title = `${jobTitles[i % jobTitles.length]} ${i + 1}`;
  const company = companies[i % companies.length];
  const location = locations[i % locations.length];
  const department = departments[i % departments.length];
  const seniority = seniorityLevels[i % seniorityLevels.length];

  const shortDesc = `Exciting opportunity for a ${title} at ${company}. Join our team to work on cutting-edge projects and grow your career.`;

  const fullDesc = `${shortDesc}

**Responsibilities:**
- Collaborate with cross-functional teams to design, develop, and deliver scalable software solutions.
- Participate in code reviews and contribute to continuous improvement.
- Mentor junior team members and foster a collaborative engineering culture.
- Work with modern technologies and drive innovation in ${department}.

**Who You Are:**
- Experience as a ${seniority} in ${department}.
- Strong background in modern frameworks and best engineering practices.
- Excellent communication skills and a passion for learning.

**Benefits:**
- Competitive salary and performance bonuses.
- Stock options and equity participation.
- Comprehensive health, dental, and vision insurance.
- Flexible remote work policies.
- Professional development budget and learning resources.

Apply today to become a part of ${company} and make an impact in the tech industry!`;

  stmt.run(
    title,
    shortDesc,
    location,
    company,
    department,
    seniority,
    JSON.stringify(["JavaScript", "SQL", "Git", "Agile"]),
    JSON.stringify(["React", "Python", "AWS", "Docker"]),
    60000 + i * 1000,
    80000 + i * 1000,
    'full-time',
    i % 3 === 0 ? 1 : 0,
    fullDesc   // <-- full_description field
  );
}

console.log('Database populated with 100 synthetic job listings with long descriptions');
