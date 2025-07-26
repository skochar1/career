import Database from 'better-sqlite3';
import { join } from 'path';
import { initializeSearchIndex } from './search';

let db: Database.Database;

export function getDatabase() {
  if (!db) {
    const dbPath = join(process.cwd(), 'career.db');
    db = new Database(dbPath);
    
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    initializeTables();
  }
  return db;
}

function initializeTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      company TEXT NOT NULL,
      department TEXT,
      seniority_level TEXT CHECK(seniority_level IN ('junior', 'mid', 'senior', 'lead', 'vp', 'executive')),
      required_skills TEXT,
      preferred_skills TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      employment_type TEXT CHECK(employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
      remote_eligible BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      resume_filename TEXT,
      resume_content TEXT,
      parsed_skills TEXT,
      experience_level TEXT,
      preferred_locations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS job_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER,
      job_id INTEGER,
      match_score REAL,
      matching_skills TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(candidate_id) REFERENCES candidates(id),
      FOREIGN KEY(job_id) REFERENCES jobs(id)
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
    CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority_level);
    CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
    CREATE INDEX IF NOT EXISTS idx_candidates_session ON candidates(session_id);
    CREATE INDEX IF NOT EXISTS idx_job_matches_candidate ON job_matches(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);
  `);

  seedSampleJobs();
}

function seedSampleJobs() {
  const checkExisting = db.prepare('SELECT COUNT(*) as count FROM jobs').get() as { count: number };
  
  if (checkExisting.count === 0) {
    const insertJob = db.prepare(`
      INSERT INTO jobs (
        title, description, location, company, department, seniority_level,
        required_skills, preferred_skills, salary_min, salary_max,
        employment_type, remote_eligible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleJobs = [
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
      {
        title: 'Registered Nurse',
        description: 'Provide excellent patient care in our modern medical facility.',
        location: 'Boston, MA',
        company: 'HealthFirst Medical',
        department: 'Nursing',
        seniority_level: 'mid',
        required_skills: JSON.stringify(['Nursing License', 'Patient Care', 'Medical Records']),
        preferred_skills: JSON.stringify(['ICU Experience', 'Electronic Health Records']),
        salary_min: 65000,
        salary_max: 85000,
        employment_type: 'full-time',
        remote_eligible: false
      },
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
      }
    ];

    const insertMany = db.transaction((jobs: typeof sampleJobs) => {
      for (const job of jobs) {
        insertJob.run(
          job.title, job.description, job.location, job.company, job.department,
          job.seniority_level, job.required_skills, job.preferred_skills,
          job.salary_min, job.salary_max, job.employment_type, job.remote_eligible
        );
      }
    });

    insertMany(sampleJobs);
  }
  
  const allJobs = db.prepare('SELECT * FROM jobs WHERE is_active = 1').all();
  const processedJobs = allJobs.map((job: any) => ({
    ...job,
    required_skills: JSON.parse(job.required_skills || '[]'),
    preferred_skills: JSON.parse(job.preferred_skills || '[]')
  }));
  
  initializeSearchIndex(processedJobs);
}

export interface Job {
  id: number;
  title: string;
  description: string;
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