import { sql } from '@vercel/postgres';
// import { initializeSearchIndex } from './search';

export async function initializeDatabase() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      full_description TEXT,
      location TEXT NOT NULL,
      company TEXT NOT NULL,
      department TEXT,
      seniority_level TEXT CHECK(seniority_level IN ('junior', 'mid', 'senior', 'lead', 'vp', 'executive')),
      required_skills TEXT,
      preferred_skills TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      employment_type TEXT CHECK(employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
      remote_eligible BOOLEAN DEFAULT FALSE,
      embedding TEXT, -- JSON array of embedding values
      embedding_hash TEXT, -- Hash of content used to generate embedding
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS candidates (
      id SERIAL PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      resume_filename TEXT,
      resume_content TEXT,
      parsed_skills TEXT,
      experience_level TEXT,
      preferred_locations TEXT,
      enhanced_data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS job_matches (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER REFERENCES candidates(id),
      job_id INTEGER REFERENCES jobs(id),
      match_score REAL,
      matching_skills TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority_level);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_jobs_embedding_hash ON jobs(embedding_hash);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_candidates_session ON candidates(session_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_job_matches_candidate ON job_matches(candidate_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);`;

  await seedSampleJobs();
}

async function seedSampleJobs() {
  const { rows: existing } = await sql`SELECT COUNT(*) as count FROM jobs`;
  
  if (existing[0].count === '0') {
    const sampleJobs = [
      // Engineering roles
      {
        title: 'Senior Software Engineer',
        description: 'Build scalable web applications using modern technologies. Lead technical decisions and mentor junior developers.',
        location: 'San Francisco, CA',
        company: 'TechCorp Inc',
        department: 'Engineering',
        seniority_level: 'senior',
        required_skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'PostgreSQL']),
        preferred_skills: JSON.stringify(['TypeScript', 'AWS', 'Docker']),
        salary_min: 140000,
        salary_max: 180000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      {
        title: 'Junior Frontend Developer',
        description: 'Join our team to build amazing user interfaces. Perfect for recent graduates or career changers.',
        location: 'New York, NY',
        company: 'StartupXYZ',
        department: 'Engineering',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['HTML', 'CSS', 'JavaScript']),
        preferred_skills: JSON.stringify(['React', 'TypeScript']),
        salary_min: 70000,
        salary_max: 90000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage cloud infrastructure and CI/CD pipelines. Ensure high availability and scalability.',
        location: 'Denver, CO',
        company: 'CloudNative Solutions',
        department: 'Engineering',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['AWS', 'Kubernetes', 'Docker', 'Linux']),
        preferred_skills: JSON.stringify(['Terraform', 'Prometheus', 'GitLab CI']),
        salary_min: 100000,
        salary_max: 130000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      {
        title: 'VP of Engineering',
        description: 'Lead our engineering organization and drive technical strategy for the company.',
        location: 'Austin, TX',
        company: 'GrowthCo',
        department: 'Engineering',
        seniority_level: 'vp',
        required_skills: JSON.stringify(['Leadership', 'Technical Strategy', 'Team Management']),
        preferred_skills: JSON.stringify(['Scaling Teams', 'Architecture', 'Product Strategy']),
        salary_min: 250000,
        salary_max: 350000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      // Healthcare roles
      {
        title: 'Registered Nurse',
        description: 'Provide excellent patient care in our modern medical facility.',
        location: 'Boston, MA',
        company: 'HealthFirst Medical',
        department: 'Healthcare',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Nursing License', 'Patient Care', 'Medical Records']),
        preferred_skills: JSON.stringify(['ICU Experience', 'Electronic Health Records']),
        salary_min: 65000,
        salary_max: 85000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      {
        title: 'Physician Assistant',
        description: 'Work alongside physicians to provide comprehensive patient care.',
        location: 'Chicago, IL',
        company: 'Metro Health System',
        department: 'Healthcare',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['PA License', 'Clinical Skills', 'Patient Assessment']),
        preferred_skills: JSON.stringify(['Emergency Medicine', 'Surgery Experience']),
        salary_min: 95000,
        salary_max: 125000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      // Data & Analytics roles
      {
        title: 'Data Scientist',
        description: 'Analyze complex datasets to drive business insights and build predictive models.',
        location: 'Seattle, WA',
        company: 'DataDriven Corp',
        department: 'Analytics',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Python', 'SQL', 'Machine Learning', 'Statistics']),
        preferred_skills: JSON.stringify(['TensorFlow', 'AWS', 'Spark']),
        salary_min: 110000,
        salary_max: 140000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      {
        title: 'Business Analyst',
        description: 'Bridge the gap between business needs and technical solutions. Analyze processes and recommend improvements.',
        location: 'Atlanta, GA',
        company: 'Business Solutions Inc',
        department: 'Analytics',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['Excel', 'SQL', 'Process Analysis', 'Documentation']),
        preferred_skills: JSON.stringify(['Tableau', 'Power BI', 'Agile']),
        salary_min: 60000,
        salary_max: 80000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      // Marketing roles
      {
        title: 'Digital Marketing Manager',
        description: 'Lead digital marketing campaigns across multiple channels. Drive customer acquisition and engagement.',
        location: 'Los Angeles, CA',
        company: 'Brand Builders',
        department: 'Marketing',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Digital Marketing', 'Google Ads', 'Social Media', 'Analytics']),
        preferred_skills: JSON.stringify(['SEO', 'Content Strategy', 'Marketing Automation']),
        salary_min: 75000,
        salary_max: 95000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      {
        title: 'Content Writer',
        description: 'Create compelling content for websites, blogs, and marketing materials.',
        location: 'Remote',
        company: 'ContentCraft Agency',
        department: 'Marketing',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['Writing', 'Research', 'SEO', 'Content Management']),
        preferred_skills: JSON.stringify(['WordPress', 'Social Media', 'Email Marketing']),
        salary_min: 45000,
        salary_max: 60000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      // Finance roles
      {
        title: 'Financial Analyst',
        description: 'Analyze financial data and create reports to support business decisions.',
        location: 'New York, NY',
        company: 'Investment Partners',
        department: 'Finance',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Excel', 'Financial Analysis', 'Accounting', 'Financial Modeling']),
        preferred_skills: JSON.stringify(['Bloomberg', 'Python', 'CFA']),
        salary_min: 80000,
        salary_max: 100000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      {
        title: 'Accountant',
        description: 'Manage accounts payable, receivable, and general ledger activities.',
        location: 'Phoenix, AZ',
        company: 'Accounting Associates',
        department: 'Finance',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['QuickBooks', 'Excel', 'Accounting Principles', 'Tax Preparation']),
        preferred_skills: JSON.stringify(['CPA', 'Sage', 'Financial Reporting']),
        salary_min: 45000,
        salary_max: 60000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      // Sales roles
      {
        title: 'Sales Representative',
        description: 'Build relationships with clients and drive revenue through consultative selling.',
        location: 'Dallas, TX',
        company: 'Sales Solutions Corp',
        department: 'Sales',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['Sales', 'Communication', 'CRM', 'Negotiation']),
        preferred_skills: JSON.stringify(['Salesforce', 'Lead Generation', 'B2B Sales']),
        salary_min: 50000,
        salary_max: 70000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      {
        title: 'Account Manager',
        description: 'Manage key client relationships and ensure customer satisfaction and retention.',
        location: 'Miami, FL',
        company: 'Client Success Partners',
        department: 'Sales',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Account Management', 'Customer Success', 'Communication', 'Problem Solving']),
        preferred_skills: JSON.stringify(['Salesforce', 'Project Management', 'Upselling']),
        salary_min: 65000,
        salary_max: 85000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      // Education roles
      {
        title: 'Elementary School Teacher',
        description: 'Educate and inspire young learners in grades K-5.',
        location: 'Portland, OR',
        company: 'Pacific Elementary',
        department: 'Education',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Teaching License', 'Classroom Management', 'Curriculum Development', 'Child Psychology']),
        preferred_skills: JSON.stringify(['Technology Integration', 'Special Education', 'ESL']),
        salary_min: 45000,
        salary_max: 65000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      // Design roles
      {
        title: 'UX Designer',
        description: 'Design intuitive user experiences for web and mobile applications.',
        location: 'San Diego, CA',
        company: 'Design Studio',
        department: 'Design',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Figma', 'User Research', 'Wireframing', 'Prototyping']),
        preferred_skills: JSON.stringify(['Adobe Creative Suite', 'HTML/CSS', 'User Testing']),
        salary_min: 85000,
        salary_max: 110000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      {
        title: 'Graphic Designer',
        description: 'Create visual designs for print and digital media.',
        location: 'Nashville, TN',
        company: 'Creative Agency',
        department: 'Design',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['Adobe Creative Suite', 'Typography', 'Brand Design', 'Print Design']),
        preferred_skills: JSON.stringify(['Web Design', 'Motion Graphics', 'Photography']),
        salary_min: 40000,
        salary_max: 55000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      // Operations roles
      {
        title: 'Operations Manager',
        description: 'Oversee daily operations and improve operational efficiency.',
        location: 'Charlotte, NC',
        company: 'Logistics Plus',
        department: 'Operations',
        seniority_level: 'senior',
        required_skills: JSON.stringify(['Operations Management', 'Process Improvement', 'Team Leadership', 'Budget Management']),
        preferred_skills: JSON.stringify(['Lean Six Sigma', 'Supply Chain', 'ERP Systems']),
        salary_min: 90000,
        salary_max: 120000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      {
        title: 'Project Coordinator',
        description: 'Support project management activities and ensure timely delivery.',
        location: 'Salt Lake City, UT',
        company: 'Project Solutions',
        department: 'Operations',
        seniority_level: 'junior',
        required_skills: JSON.stringify(['Project Management', 'Communication', 'Organization', 'Microsoft Office']),
        preferred_skills: JSON.stringify(['Agile', 'Jira', 'PMP Certification']),
        salary_min: 45000,
        salary_max: 60000,
        employment_type: 'full-time',
        remote_eligible: true
      },
      // Add hybrid jobs for testing
      {
        title: 'Hybrid Marketing Specialist',
        description: 'Work in a hybrid environment combining remote and office work to develop comprehensive marketing strategies.',
        location: 'San Francisco, CA',
        company: 'HybridWork Inc',
        department: 'Marketing',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Marketing Strategy', 'Social Media', 'Analytics', 'Communication']),
        preferred_skills: JSON.stringify(['HubSpot', 'Google Analytics', 'Content Creation']),
        salary_min: 70000,
        salary_max: 90000,
        employment_type: 'full-time',
        remote_eligible: false
      },
      {
        title: 'Software Engineer - Hybrid Model',
        description: 'Join our hybrid team working both remotely and in-office. Build innovative software solutions.',
        location: 'Austin, TX',
        company: 'FlexTech Solutions',
        department: 'Engineering',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['JavaScript', 'Python', 'API Development', 'Database Design']),
        preferred_skills: JSON.stringify(['React', 'Django', 'PostgreSQL']),
        salary_min: 95000,
        salary_max: 125000,
        employment_type: 'full-time',
        remote_eligible: false
      }
    ];

    // Insert all jobs
    for (const job of sampleJobs) {
      await sql`
        INSERT INTO jobs (
          title, description, location, company, department, seniority_level,
          required_skills, preferred_skills, salary_min, salary_max,
          employment_type, remote_eligible
        ) VALUES (
          ${job.title}, ${job.description}, ${job.location}, ${job.company}, 
          ${job.department}, ${job.seniority_level}, ${job.required_skills}, 
          ${job.preferred_skills}, ${job.salary_min}, ${job.salary_max}, 
          ${job.employment_type}, ${job.remote_eligible}
        )
      `;
    }
  }
  
  // Initialize search index with jobs
  const { rows: allJobs } = await sql`SELECT * FROM jobs WHERE is_active = true`;
  const processedJobs = allJobs.map((job: any) => ({
    ...job,
    required_skills: JSON.parse(job.required_skills || '[]'),
    preferred_skills: JSON.parse(job.preferred_skills || '[]')
  }));
  
  // initializeSearchIndex(processedJobs);
}

export interface Job {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  location: string;
  company: string;
  department?: string;
  seniority_level: 'junior' | 'mid' | 'senior' | 'lead' | 'vp' | 'executive';
  required_skills: string;
  preferred_skills?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote_eligible: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Candidate {
  id: number;
  session_id: string;
  resume_filename?: string;
  resume_content?: string;
  parsed_skills?: string;
  experience_level?: string;
  preferred_locations?: string;
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: number;
  candidate_id: number;
  job_id: number;
  match_score: number;
  matching_skills?: string;
  created_at: string;
}

// Utility functions for PostgreSQL queries
export { sql };