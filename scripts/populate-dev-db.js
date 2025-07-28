#!/usr/bin/env node
/**
 * Populate Dev Database with Enhanced Synthetic Data
 */

const { getDatabase } = require('../lib/database');
const { generateSyntheticJobs } = require('./generate-synthetic-jobs');

async function populateDevDatabase() {
  console.log('🚀 Populating dev database with comprehensive synthetic job data...');
  
  try {
    // Generate synthetic jobs
    const jobs = generateSyntheticJobs();
    
    // Get database connection
    const db = getDatabase();
    
    // Clear existing data
    console.log('🗑️  Clearing existing job data...');
    
    // Disable foreign key constraints temporarily
    db.pragma('foreign_keys = OFF');
    
    // Clear related tables first
    db.prepare('DELETE FROM job_matches').run();
    db.prepare('DELETE FROM jobs').run();
    
    // Re-enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    // Prepare insert statement
    const insertJob = db.prepare(`
      INSERT INTO jobs (
        title, description, full_description, location, company, department, seniority_level,
        required_skills, preferred_skills, salary_min, salary_max,
        employment_type, remote_eligible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Insert jobs in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      
      const insertBatch = db.transaction((jobsBatch) => {
        for (const job of jobsBatch) {
          insertJob.run(
            job.title,
            job.description,
            job.full_description || job.description,
            job.location,
            job.company,
            job.department,
            job.seniority_level,
            JSON.stringify(job.required_skills),
            JSON.stringify(job.preferred_skills),
            job.salary_min,
            job.salary_max,
            job.employment_type,
            job.remote_eligible ? 1 : 0
          );
        }
      });
      
      insertBatch(batch);
      inserted += batch.length;
      console.log(`📊 Inserted ${inserted}/${jobs.length} jobs...`);
    }
    
    // Verify insertion
    const count = db.prepare('SELECT COUNT(*) as count FROM jobs').get().count;
    console.log(`✅ Successfully populated dev database with ${count} jobs!`);
    
    // Log some statistics
    const stats = {
      departments: db.prepare('SELECT DISTINCT department FROM jobs').all().length,
      companies: db.prepare('SELECT DISTINCT company FROM jobs').all().length,
      locations: db.prepare('SELECT DISTINCT location FROM jobs').all().length,
      employmentTypes: db.prepare('SELECT DISTINCT employment_type FROM jobs').all().length,
      remoteJobs: db.prepare('SELECT COUNT(*) as count FROM jobs WHERE remote_eligible = 1').get().count
    };
    
    console.log('📈 Database Statistics:');
    console.log(`  • Total jobs: ${count}`);
    console.log(`  • Departments: ${stats.departments}`);
    console.log(`  • Companies: ${stats.companies}`);
    console.log(`  • Locations: ${stats.locations}`);
    console.log(`  • Employment types: ${stats.employmentTypes}`);
    console.log(`  • Remote eligible: ${stats.remoteJobs}`);
    
  } catch (error) {
    console.error('❌ Error populating dev database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  populateDevDatabase();
}

module.exports = { populateDevDatabase };