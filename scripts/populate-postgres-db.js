#!/usr/bin/env node
/**
 * Populate PostgreSQL Database with Enhanced Synthetic Data
 */

const { sql } = require('@vercel/postgres');
const { generateSyntheticJobs } = require('./generate-synthetic-jobs');

async function populatePostgresDatabase() {
  console.log('🚀 Populating PostgreSQL database with comprehensive synthetic job data...');
  
  try {
    // Generate synthetic jobs
    console.log('📝 Generating jobs...');
    const jobs = generateSyntheticJobs();
    
    // Clear existing data
    console.log('🗑️  Clearing existing job data...');
    await sql`DELETE FROM jobs WHERE id > 0`; // Keep any manually added jobs with id <= 0
    
    // Insert jobs in batches
    const batchSize = 10; // Even smaller batches for PostgreSQL
    let inserted = 0;
    
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      
      console.log(`📊 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(jobs.length / batchSize)}...`);
      
      // Insert each job in the batch
      for (const job of batch) {
        await sql`
          INSERT INTO jobs (
            title, description, full_description, location, company, department, seniority_level,
            required_skills, preferred_skills, salary_min, salary_max,
            employment_type, remote_eligible
          ) VALUES (
            ${job.title},
            ${job.description},
            ${job.full_description || job.description},
            ${job.location},
            ${job.company},
            ${job.department},
            ${job.seniority_level},
            ${JSON.stringify(job.required_skills)},
            ${JSON.stringify(job.preferred_skills)},
            ${job.salary_min},
            ${job.salary_max},
            ${job.employment_type},
            ${job.remote_eligible}
          )
        `;
        inserted++;
      }
      
      console.log(`📊 Inserted ${inserted}/${jobs.length} jobs...`);
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Verify insertion
    const { rows: countResult } = await sql`SELECT COUNT(*) as count FROM jobs`;
    const count = countResult[0].count;
    console.log(`✅ Successfully populated PostgreSQL database with ${count} jobs!`);
    
    // Log some statistics
    const { rows: deptResult } = await sql`SELECT DISTINCT department FROM jobs`;
    const { rows: companyResult } = await sql`SELECT DISTINCT company FROM jobs`;
    const { rows: locationResult } = await sql`SELECT DISTINCT location FROM jobs`;
    const { rows: empTypeResult } = await sql`SELECT DISTINCT employment_type FROM jobs`;
    const { rows: remoteResult } = await sql`SELECT COUNT(*) as count FROM jobs WHERE remote_eligible = true`;
    
    console.log('📈 Database Statistics:');
    console.log(`  • Total jobs: ${count}`);
    console.log(`  • Departments: ${deptResult.length}`);
    console.log(`  • Companies: ${companyResult.length}`);
    console.log(`  • Locations: ${locationResult.length}`);
    console.log(`  • Employment types: ${empTypeResult.length}`);
    console.log(`  • Remote eligible: ${remoteResult[0].count}`);
    
  } catch (error) {
    console.error('❌ Error populating PostgreSQL database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  populatePostgresDatabase();
}

module.exports = { populatePostgresDatabase };