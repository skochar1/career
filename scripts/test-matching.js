#!/usr/bin/env node
/**
 * Test Job Matching Logic
 */

const { getDatabase } = require('../lib/database');

async function testMatching() {
  console.log('🧪 Testing job matching logic...');
  
  try {
    const db = getDatabase();
    
    // Get a test candidate
    const candidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get('session_1753709600141_16p0gp8v6');
    
    if (!candidate) {
      console.log('❌ No test candidate found');
      return;
    }
    
    console.log('✅ Found candidate:', candidate.resume_filename);
    
    // Check enhanced data
    let enhancedData = null;
    try {
      enhancedData = JSON.parse(candidate.enhanced_data);
      console.log('✅ Enhanced data parsed:', {
        skills: enhancedData.skills?.slice(0, 5),
        experienceLevel: enhancedData.experienceLevel
      });
    } catch (e) {
      console.log('❌ Failed to parse enhanced data:', e.message);
    }
    
    // Get some jobs
    const jobs = db.prepare('SELECT * FROM jobs WHERE is_active = 1 LIMIT 10').all();
    console.log(`✅ Found ${jobs.length} jobs`);
    
    // Test basic filtering
    const engineeringJobs = jobs.filter(job => job.department === 'Engineering');
    console.log(`✅ Found ${engineeringJobs.length} engineering jobs`);
    
    // Check job data structure
    const sampleJob = jobs[0];
    console.log('✅ Sample job structure:', {
      id: sampleJob.id,
      title: sampleJob.title,
      department: sampleJob.department,
      required_skills: sampleJob.required_skills,
      remote_eligible: sampleJob.remote_eligible
    });
    
    // Parse job skills
    let parsedSkills;
    try {
      parsedSkills = JSON.parse(sampleJob.required_skills);
      console.log('✅ Job skills parsed:', parsedSkills?.slice(0, 3));
    } catch (e) {
      console.log('❌ Failed to parse job skills:', e.message);
    }
    
    // Test OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      console.log('✅ OpenAI API key is set');
    } else {
      console.log('❌ OpenAI API key is missing');
    }
    
    console.log('🎉 Basic matching test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMatching();