#!/usr/bin/env ts-node
/**
 * Synthetic Job Data Generator
 * Creates diverse job listings covering all filter categories and international locations
 */

interface JobData {
  title: string;
  description: string;
  full_description?: string;
  location: string;
  company: string;
  department: string;
  seniority_level: 'junior' | 'mid' | 'senior' | 'lead' | 'vp' | 'executive';
  required_skills: string[];
  preferred_skills: string[];
  salary_min: number;
  salary_max: number;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote_eligible: boolean;
}

// Global companies with diverse locations
const companies = [
  { name: 'Microsoft', locations: ['Redmond, WA', 'San Francisco, CA', 'Austin, TX', 'London, UK', 'Dublin, Ireland', 'Bangalore, India'] },
  { name: 'Google', locations: ['Mountain View, CA', 'New York, NY', 'London, UK', 'Zurich, Switzerland', 'Tokyo, Japan', 'Sydney, Australia'] },
  { name: 'Amazon', locations: ['Seattle, WA', 'Austin, TX', 'Berlin, Germany', 'Vancouver, Canada', 'São Paulo, Brazil', 'Singapore'] },
  { name: 'Meta', locations: ['Menlo Park, CA', 'London, UK', 'Tel Aviv, Israel', 'Singapore', 'Dublin, Ireland'] },
  { name: 'Apple', locations: ['Cupertino, CA', 'Austin, TX', 'Cork, Ireland', 'Munich, Germany', 'Tokyo, Japan'] },
  { name: 'Spotify', locations: ['Stockholm, Sweden', 'New York, NY', 'London, UK', 'Berlin, Germany', 'Barcelona, Spain'] },
  { name: 'Shopify', locations: ['Toronto, Canada', 'Ottawa, Canada', 'Berlin, Germany', 'Dublin, Ireland', 'Remote'] },
  { name: 'Atlassian', locations: ['Sydney, Australia', 'San Francisco, CA', 'Austin, TX', 'Amsterdam, Netherlands'] },
  { name: 'Stripe', locations: ['San Francisco, CA', 'Dublin, Ireland', 'Singapore', 'São Paulo, Brazil', 'Remote'] },
  { name: 'Netflix', locations: ['Los Gatos, CA', 'Los Angeles, CA', 'Amsterdam, Netherlands', 'Tokyo, Japan', 'Remote'] },
  { name: 'Uber', locations: ['San Francisco, CA', 'Amsterdam, Netherlands', 'London, UK', 'São Paulo, Brazil', 'Bangalore, India'] },
  { name: 'Airbnb', locations: ['San Francisco, CA', 'Barcelona, Spain', 'Dublin, Ireland', 'Singapore', 'Remote'] },
  { name: 'Salesforce', locations: ['San Francisco, CA', 'Indianapolis, IN', 'London, UK', 'Tokyo, Japan', 'Dublin, Ireland'] },
  { name: 'Adobe', locations: ['San Jose, CA', 'Seattle, WA', 'London, UK', 'Bangalore, India', 'Bucharest, Romania'] },
  { name: 'NVIDIA', locations: ['Santa Clara, CA', 'Austin, TX', 'Tel Aviv, Israel', 'Munich, Germany', 'Tokyo, Japan'] },
];

// Skills by category
const skillsByCategory = {
  frontend: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Sass', 'Webpack', 'Next.js'],
  backend: ['Node.js', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', 'Scala', 'Kotlin', 'Express.js'],
  database: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'Neo4j'],
  cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI', 'CircleCI'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Ionic', 'Unity'],
  ai: ['Machine Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API', 'Computer Vision', 'NLP'],
  design: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing'],
  marketing: ['Google Analytics', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing'],
  sales: ['Salesforce', 'HubSpot', 'Lead Generation', 'B2B Sales', 'Account Management', 'CRM'],
  finance: ['Excel', 'Financial Modeling', 'Bloomberg Terminal', 'SQL', 'Python', 'R', 'QuickBooks'],
  healthcare: ['HIPAA', 'Medical Terminology', 'Electronic Health Records', 'Clinical Research', 'FDA Regulations'],
  analytics: ['Tableau', 'Power BI', 'SQL', 'Python', 'R', 'Statistics', 'Data Visualization', 'Excel'],
  operations: ['Project Management', 'Lean Six Sigma', 'Supply Chain', 'Logistics', 'Process Improvement'],
  education: ['Curriculum Development', 'Classroom Management', 'Educational Technology', 'Assessment Design']
};

const jobTemplates: Partial<JobData>[] = [
  // Engineering Jobs
  {
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Lead the development of scalable web applications using modern full-stack technologies. Collaborate with cross-functional teams to deliver high-quality software solutions.',
    required_skills: [...skillsByCategory.frontend.slice(0, 3), ...skillsByCategory.backend.slice(0, 2), ...skillsByCategory.database.slice(0, 1)],
    preferred_skills: [...skillsByCategory.cloud.slice(0, 2), 'GraphQL', 'Microservices'],
    salary_min: 130000,
    salary_max: 180000,
  },
  {
    title: 'Junior Frontend Developer',
    department: 'Engineering',
    seniority_level: 'junior',
    employment_type: 'full-time',
    description: 'Build responsive and interactive user interfaces. Perfect opportunity for recent bootcamp graduates or CS students to grow their career.',
    required_skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    preferred_skills: ['TypeScript', 'Git', 'Figma'],
    salary_min: 70000,
    salary_max: 95000,
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Manage cloud infrastructure and implement CI/CD pipelines. Ensure high availability and scalability of our systems.',
    required_skills: [...skillsByCategory.cloud.slice(0, 4)],
    preferred_skills: ['Python', 'Monitoring', 'Security'],
    salary_min: 110000,
    salary_max: 150000,
  },
  {
    title: 'Mobile App Developer',
    department: 'Engineering',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Develop native and cross-platform mobile applications. Work with designers and product managers to create exceptional user experiences.',
    required_skills: [...skillsByCategory.mobile.slice(0, 3)],
    preferred_skills: ['Firebase', 'App Store Optimization', 'Unit Testing'],
    salary_min: 100000,
    salary_max: 140000,
  },
  {
    title: 'AI/ML Engineer',
    department: 'Engineering',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Design and implement machine learning models to solve complex business problems. Work with large datasets and cutting-edge AI technologies.',
    required_skills: [...skillsByCategory.ai.slice(0, 4), 'Python'],
    preferred_skills: ['MLOps', 'Data Engineering', 'Statistics'],
    salary_min: 150000,
    salary_max: 220000,
  },

  // Marketing Jobs
  {
    title: 'Digital Marketing Manager',
    department: 'Marketing',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Lead digital marketing campaigns across multiple channels. Analyze performance metrics and optimize marketing strategies for better ROI.',
    required_skills: [...skillsByCategory.marketing.slice(0, 4)],
    preferred_skills: ['A/B Testing', 'Marketing Automation', 'Adobe Creative Suite'],
    salary_min: 75000,
    salary_max: 110000,
  },
  {
    title: 'Content Marketing Specialist',
    department: 'Marketing',
    seniority_level: 'junior',
    employment_type: 'full-time',
    description: 'Create engaging content for various marketing channels. Collaborate with design and product teams to tell compelling brand stories.',
    required_skills: ['Content Marketing', 'SEO', 'Social Media Marketing', 'Writing'],
    preferred_skills: ['Video Editing', 'Graphic Design', 'Analytics'],
    salary_min: 50000,
    salary_max: 70000,
  },
  {
    title: 'Marketing Director',
    department: 'Marketing',
    seniority_level: 'vp',
    employment_type: 'full-time',
    description: 'Lead the global marketing strategy and manage a team of marketing professionals. Drive brand awareness and customer acquisition.',
    required_skills: ['Strategic Planning', 'Team Leadership', 'Brand Management', 'Budget Management'],
    preferred_skills: ['International Marketing', 'PR', 'Event Management'],
    salary_min: 160000,
    salary_max: 250000,
  },

  // Sales Jobs
  {
    title: 'Sales Development Representative',
    department: 'Sales',
    seniority_level: 'junior',
    employment_type: 'full-time',
    description: 'Generate and qualify leads for the sales team. Perfect entry-level role for those looking to start a career in tech sales.',
    required_skills: [...skillsByCategory.sales.slice(0, 3)],
    preferred_skills: ['Cold Calling', 'Email Marketing', 'LinkedIn Sales Navigator'],
    salary_min: 45000,
    salary_max: 65000,
  },
  {
    title: 'Enterprise Account Executive',
    department: 'Sales',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Manage large enterprise accounts and drive revenue growth. Build relationships with C-level executives and close complex deals.',
    required_skills: ['B2B Sales', 'Account Management', 'Negotiation', 'Salesforce'],
    preferred_skills: ['Enterprise Software', 'Solution Selling', 'Territory Management'],
    salary_min: 120000,
    salary_max: 200000,
  },

  // Healthcare Jobs
  {
    title: 'Clinical Data Analyst',
    department: 'Healthcare',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Analyze clinical trial data and ensure compliance with regulatory requirements. Support drug development and approval processes.',
    required_skills: [...skillsByCategory.healthcare.slice(0, 4), 'SQL'],
    preferred_skills: ['SAS', 'R', 'Statistics', 'Clinical Trials'],
    salary_min: 80000,
    salary_max: 120000,
  },
  {
    title: 'Registered Nurse',
    department: 'Healthcare',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Provide direct patient care in a fast-paced hospital environment. Work with interdisciplinary teams to ensure optimal patient outcomes.',
    required_skills: ['Nursing License', 'Patient Care', 'Medical Terminology', 'HIPAA'],
    preferred_skills: ['ICU Experience', 'EMR Systems', 'BLS Certification'],
    salary_min: 70000,
    salary_max: 95000,
  },

  // Finance Jobs
  {
    title: 'Financial Analyst',
    department: 'Finance',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Perform financial analysis and modeling to support business decisions. Prepare reports and presentations for senior management.',
    required_skills: [...skillsByCategory.finance.slice(0, 4)],
    preferred_skills: ['VBA', 'Tableau', 'FP&A', 'Budgeting'],
    salary_min: 75000,
    salary_max: 110000,
  },
  {
    title: 'Investment Banking Associate',
    department: 'Finance',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Execute M&A transactions and capital raising activities. Work with clients on complex financial transactions and strategic initiatives.',
    required_skills: ['Financial Modeling', 'Excel', 'PowerPoint', 'Bloomberg Terminal'],
    preferred_skills: ['M&A Experience', 'Industry Knowledge', 'Client Management'],
    salary_min: 150000,
    salary_max: 250000,
  },

  // Analytics Jobs
  {
    title: 'Data Scientist',
    department: 'Analytics',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Build predictive models and extract insights from large datasets. Collaborate with product and engineering teams to drive data-driven decisions.',
    required_skills: [...skillsByCategory.analytics.slice(0, 5)],
    preferred_skills: ['Machine Learning', 'A/B Testing', 'Big Data'],
    salary_min: 130000,
    salary_max: 180000,
  },
  {
    title: 'Business Intelligence Analyst',
    department: 'Analytics',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Create dashboards and reports to help stakeholders make informed business decisions. Transform raw data into actionable insights.',
    required_skills: ['Tableau', 'SQL', 'Excel', 'Data Visualization'],
    preferred_skills: ['Power BI', 'Python', 'Statistics'],
    salary_min: 70000,
    salary_max: 100000,
  },

  // Design Jobs
  {
    title: 'Senior UX Designer',
    department: 'Design',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Lead user experience design for digital products. Conduct user research and create intuitive, accessible interfaces.',
    required_skills: [...skillsByCategory.design.slice(0, 5)],
    preferred_skills: ['Accessibility', 'Design Systems', 'Usability Testing'],
    salary_min: 110000,
    salary_max: 150000,
  },
  {
    title: 'Product Designer',
    department: 'Design',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Design end-to-end product experiences from concept to launch. Work closely with product managers and engineers.',
    required_skills: ['Figma', 'Prototyping', 'User Research', 'Design Thinking'],
    preferred_skills: ['Animation', 'Front-end Development', 'Workshop Facilitation'],
    salary_min: 90000,
    salary_max: 130000,
  },

  // Operations Jobs
  {
    title: 'Operations Manager',
    department: 'Operations',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Optimize business processes and manage day-to-day operations. Lead cross-functional initiatives to improve efficiency.',
    required_skills: [...skillsByCategory.operations.slice(0, 4)],
    preferred_skills: ['Data Analysis', 'Change Management', 'Vendor Management'],
    salary_min: 90000,
    salary_max: 130000,
  },
  {
    title: 'Supply Chain Analyst',
    department: 'Operations',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Analyze supply chain data to optimize inventory and reduce costs. Work with suppliers and internal teams to improve efficiency.',
    required_skills: ['Supply Chain', 'Excel', 'Data Analysis', 'Logistics'],
    preferred_skills: ['SAP', 'Forecasting', 'Procurement'],
    salary_min: 65000,
    salary_max: 90000,
  },

  // Education Jobs
  {
    title: 'Learning & Development Manager',
    department: 'Education',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Design and implement employee training programs. Create learning materials and assess training effectiveness.',
    required_skills: [...skillsByCategory.education.slice(0, 4)],
    preferred_skills: ['LMS Administration', 'Training Delivery', 'Performance Management'],
    salary_min: 75000,
    salary_max: 110000,
  },
  {
    title: 'Corporate Trainer',
    department: 'Education',
    seniority_level: 'mid',
    employment_type: 'contract',
    description: 'Deliver technical and soft skills training to employees. Develop interactive workshops and e-learning modules.',
    required_skills: ['Training Delivery', 'Curriculum Development', 'Educational Technology'],
    preferred_skills: ['Video Production', 'Public Speaking', 'Adult Learning Principles'],
    salary_min: 60000,
    salary_max: 85000,
  },

  // Part-time and Contract roles
  {
    title: 'Part-time Social Media Manager',
    department: 'Marketing',
    seniority_level: 'mid',
    employment_type: 'part-time',
    description: 'Manage social media presence and create engaging content. Perfect for experienced marketers seeking work-life balance.',
    required_skills: ['Social Media Marketing', 'Content Marketing', 'Analytics'],
    preferred_skills: ['Video Editing', 'Community Management', 'Influencer Relations'],
    salary_min: 30000,
    salary_max: 50000,
    remote_eligible: true,
  },
  {
    title: 'Freelance Web Developer',
    department: 'Engineering',
    seniority_level: 'mid',
    employment_type: 'contract',
    description: 'Build custom websites and web applications for various clients. Flexible schedule with project-based work.',
    required_skills: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
    preferred_skills: ['React', 'E-commerce', 'SEO'],
    salary_min: 50,
    salary_max: 100, // hourly rates
    remote_eligible: true,
  },

  // Internships
  {
    title: 'Software Engineering Intern',
    department: 'Engineering',
    seniority_level: 'junior',
    employment_type: 'internship',
    description: 'Join our engineering team for a summer internship. Work on real projects and learn from experienced engineers.',
    required_skills: ['Programming', 'Git', 'Problem Solving'],
    preferred_skills: ['JavaScript', 'Python', 'Agile'],
    salary_min: 5000,
    salary_max: 8000, // monthly
  },
  {
    title: 'Marketing Intern',
    department: 'Marketing',
    seniority_level: 'junior',
    employment_type: 'internship',
    description: 'Support marketing campaigns and learn about digital marketing strategies. Great opportunity for students.',
    required_skills: ['Communication', 'Social Media', 'Microsoft Office'],
    preferred_skills: ['Analytics', 'Design', 'Writing'],
    salary_min: 3000,
    salary_max: 5000, // monthly
  },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateJobs(count: number): JobData[] {
  const jobs: JobData[] = [];

  for (let i = 0; i < count; i++) {
    const template = getRandomElement(jobTemplates);
    const company = getRandomElement(companies);
    const location = getRandomElement(company.locations);
    
    // Add some variability to salaries based on location
    const locationMultiplier = location.includes('San Francisco') || location.includes('New York') || location.includes('London') ? 1.2 :
                              location.includes('Remote') ? 1.1 :
                              location.includes('India') || location.includes('Brazil') ? 0.7 : 1.0;

    const job: JobData = {
      title: template.title!,
      description: template.description!,
      full_description: `${template.description!} 

Key Responsibilities:
• ${template.department === 'Engineering' ? 'Design and implement scalable software solutions' : 
     template.department === 'Marketing' ? 'Develop and execute marketing strategies' :
     template.department === 'Sales' ? 'Drive revenue growth and manage client relationships' :
     template.department === 'Healthcare' ? 'Provide quality healthcare services' :
     template.department === 'Finance' ? 'Analyze financial data and support business decisions' :
     template.department === 'Analytics' ? 'Extract insights from data to drive business value' :
     template.department === 'Design' ? 'Create user-centered design solutions' :
     template.department === 'Operations' ? 'Optimize processes and improve operational efficiency' :
     'Contribute to team goals and company success'}
• Collaborate with cross-functional teams
• Participate in planning and strategy sessions
• Mentor junior team members (for senior roles)
• Stay current with industry trends and best practices

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements
• Professional development opportunities
• Generous PTO and parental leave
• Company-sponsored learning and conferences`,
      location: location,
      company: company.name,
      department: template.department!,
      seniority_level: template.seniority_level!,
      required_skills: template.required_skills!,
      preferred_skills: template.preferred_skills!,
      salary_min: Math.round((template.salary_min! * locationMultiplier) / 1000) * 1000,
      salary_max: Math.round((template.salary_max! * locationMultiplier) / 1000) * 1000,
      employment_type: template.employment_type!,
      remote_eligible: template.remote_eligible ?? (Math.random() > 0.6), // 40% chance of remote
    };

    jobs.push(job);
  }

  return jobs;
}

// Generate the synthetic data
export function generateSyntheticJobs(): JobData[] {
  console.log('🚀 Generating synthetic job data...');
  
  // Generate 150+ diverse jobs
  const syntheticJobs = generateJobs(150);
  
  console.log(`✅ Generated ${syntheticJobs.length} synthetic jobs`);
  console.log('📊 Coverage:');
  
  // Log coverage statistics
  const departments = [...new Set(syntheticJobs.map(j => j.department))];
  const locations = [...new Set(syntheticJobs.map(j => j.location))];
  const seniorities = [...new Set(syntheticJobs.map(j => j.seniority_level))];
  const employmentTypes = [...new Set(syntheticJobs.map(j => j.employment_type))];
  
  console.log(`  • Departments: ${departments.length} (${departments.join(', ')})`);
  console.log(`  • Locations: ${locations.length} global locations`);
  console.log(`  • Seniority levels: ${seniorities.length} (${seniorities.join(', ')})`);
  console.log(`  • Employment types: ${employmentTypes.length} (${employmentTypes.join(', ')})`);
  console.log(`  • Remote eligible: ${syntheticJobs.filter(j => j.remote_eligible).length} jobs`);
  
  return syntheticJobs;
}

// For direct execution
if (require.main === module) {
  const jobs = generateSyntheticJobs();
  console.log('\n📝 Sample job:');
  console.log(JSON.stringify(jobs[0], null, 2));
}