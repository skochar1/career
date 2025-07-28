#!/usr/bin/env ts-node
/**
 * Deploy Synthetic Jobs to Production Database
 * This script uploads the generated synthetic job data to Vercel's PostgreSQL database
 */

import { generateSyntheticJobs } from './generate-synthetic-jobs';

async function deploySyntheticJobs() {
  console.log('🚀 Starting synthetic job deployment to production database...');
  
  // Generate the synthetic jobs
  const jobs = generateSyntheticJobs();
  
  try {
    console.log('📤 Sending jobs to production via API...');
    
    // We'll use the API endpoint to add jobs to avoid direct database access issues
    const apiUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/admin/populate-jobs`
      : 'https://career-site-ashy.vercel.app/api/admin/populate-jobs';
    
    console.log(`🔗 Using API endpoint: ${apiUrl}`);
    
    // Split jobs into batches to avoid timeout issues
    const batchSize = 25;
    const batches = [];
    
    for (let i = 0; i < jobs.length; i += batchSize) {
      batches.push(jobs.slice(i, i + batchSize));
    }
    
    console.log(`📦 Split ${jobs.length} jobs into ${batches.length} batches of ${batchSize}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`⏳ Processing batch ${i + 1}/${batches.length} (${batch.length} jobs)...`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add basic auth if needed
            'Authorization': 'Bearer synthetic-job-deployment'
          },
          body: JSON.stringify({ jobs: batch })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Batch ${i + 1} successful: ${result.message || 'Jobs added'}`);
          successCount += batch.length;
        } else {
          const errorText = await response.text();
          console.error(`❌ Batch ${i + 1} failed: ${response.status} ${response.statusText}`);
          console.error(`Response: ${errorText}`);
          errorCount += batch.length;
        }
      } catch (error) {
        console.error(`❌ Batch ${i + 1} error:`, error);
        errorCount += batch.length;
      }
      
      // Small delay between batches to avoid overwhelming the API
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n📊 Deployment Summary:');
    console.log(`✅ Successfully deployed: ${successCount} jobs`);
    console.log(`❌ Failed to deploy: ${errorCount} jobs`);
    console.log(`📈 Success rate: ${((successCount / jobs.length) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
      console.log('\n🎉 Synthetic job deployment completed successfully!');
      console.log('🔍 You can now test the filters and search functionality with diverse job data.');
    }
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  }
}

// For direct execution
if (require.main === module) {
  deploySyntheticJobs().catch(console.error);
}

export { deploySyntheticJobs };