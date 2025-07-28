#!/usr/bin/env node
/**
 * Populate Production Database with Synthetic Jobs
 * This script generates and uploads synthetic job data directly
 */

const https = require('https');
const http = require('http');

// Simplified job templates for direct execution
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
];

const jobTemplates = [
  {
    title: 'Senior Software Engineer',
    department: 'Engineering',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Build scalable web applications using modern technologies. Lead technical decisions and mentor junior developers.',
    required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    preferred_skills: ['TypeScript', 'AWS', 'Docker'],
    salary_min: 130000,
    salary_max: 180000,
  },
  {
    title: 'Junior Frontend Developer', 
    department: 'Engineering',
    seniority_level: 'junior',
    employment_type: 'full-time',
    description: 'Build responsive and interactive user interfaces. Perfect opportunity for recent bootcamp graduates.',
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
    description: 'Manage cloud infrastructure and implement CI/CD pipelines. Ensure high availability and scalability.',
    required_skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    preferred_skills: ['Python', 'Monitoring', 'Security'],
    salary_min: 110000,
    salary_max: 150000,
  },
  {
    title: 'Digital Marketing Manager',
    department: 'Marketing',
    seniority_level: 'mid', 
    employment_type: 'full-time',
    description: 'Lead digital marketing campaigns across multiple channels. Analyze performance metrics and optimize strategies.',
    required_skills: ['Google Analytics', 'SEO', 'SEM', 'Social Media Marketing'],
    preferred_skills: ['A/B Testing', 'Marketing Automation', 'Adobe Creative Suite'],
    salary_min: 75000,
    salary_max: 110000,
  },
  {
    title: 'Sales Development Representative',
    department: 'Sales',
    seniority_level: 'junior',
    employment_type: 'full-time', 
    description: 'Generate and qualify leads for the sales team. Perfect entry-level role for tech sales.',
    required_skills: ['Salesforce', 'Lead Generation', 'B2B Sales'],
    preferred_skills: ['Cold Calling', 'Email Marketing', 'LinkedIn Sales Navigator'],
    salary_min: 45000,
    salary_max: 65000,
  },
  {
    title: 'Data Scientist',
    department: 'Analytics',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Build predictive models and extract insights from large datasets. Drive data-driven decisions.',
    required_skills: ['Python', 'SQL', 'Tableau', 'Statistics', 'Machine Learning'],
    preferred_skills: ['R', 'A/B Testing', 'Big Data'],
    salary_min: 130000,
    salary_max: 180000,
  },
  {
    title: 'UX Designer', 
    department: 'Design',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Design user experiences for digital products. Conduct user research and create intuitive interfaces.',
    required_skills: ['Figma', 'Prototyping', 'User Research', 'Wireframing'],
    preferred_skills: ['Accessibility', 'Design Systems', 'Usability Testing'],
    salary_min: 90000,
    salary_max: 130000,
  },
  {
    title: 'Financial Analyst',
    department: 'Finance',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Perform financial analysis and modeling to support business decisions. Prepare reports for management.',
    required_skills: ['Excel', 'Financial Modeling', 'SQL', 'PowerBI'],
    preferred_skills: ['VBA', 'Tableau', 'Budgeting'],
    salary_min: 75000,
    salary_max: 110000,
  },
  {
    title: 'Operations Manager',
    department: 'Operations',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Optimize business processes and manage day-to-day operations. Lead cross-functional initiatives.',
    required_skills: ['Project Management', 'Process Improvement', 'Supply Chain', 'Logistics'],
    preferred_skills: ['Data Analysis', 'Change Management', 'Vendor Management'],
    salary_min: 90000,
    salary_max: 130000,
  },
  {
    title: 'Clinical Data Analyst',
    department: 'Healthcare',
    seniority_level: 'mid',
    employment_type: 'full-time',
    description: 'Analyze clinical trial data and ensure compliance with regulatory requirements.',
    required_skills: ['HIPAA', 'Medical Terminology', 'Clinical Research', 'SQL'],
    preferred_skills: ['SAS', 'R', 'Statistics', 'FDA Regulations'],
    salary_min: 80000,
    salary_max: 120000,
  },
  {
    title: 'Learning & Development Manager',
    department: 'Education',
    seniority_level: 'senior',
    employment_type: 'full-time',
    description: 'Design and implement employee training programs. Create learning materials and assess effectiveness.',
    required_skills: ['Curriculum Development', 'Training Delivery', 'Educational Technology', 'Assessment Design'],
    preferred_skills: ['LMS Administration', 'Performance Management'],
    salary_min: 75000,
    salary_max: 110000,
  },
  // Part-time and contract positions
  {
    title: 'Freelance Web Developer',
    department: 'Engineering',
    seniority_level: 'mid',
    employment_type: 'contract',
    description: 'Build custom websites and web applications for various clients. Flexible schedule with project-based work.',
    required_skills: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
    preferred_skills: ['React', 'E-commerce', 'SEO'],
    salary_min: 50,
    salary_max: 100,
  },
  {
    title: 'Part-time Social Media Manager',
    department: 'Marketing',
    seniority_level: 'mid',
    employment_type: 'part-time',
    description: 'Manage social media presence and create engaging content. Perfect for work-life balance.',
    required_skills: ['Social Media Marketing', 'Content Marketing', 'Analytics'],
    preferred_skills: ['Video Editing', 'Community Management'],
    salary_min: 30000,
    salary_max: 50000,
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
    salary_max: 8000,
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
    salary_max: 5000,
  },
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateJobs(count) {
  const jobs = [];
  
  for (let i = 0; i < count; i++) {
    const template = getRandomElement(jobTemplates);
    const company = getRandomElement(companies);
    const location = getRandomElement(company.locations);
    
    // Add location multiplier
    const locationMultiplier = location.includes('San Francisco') || location.includes('New York') || location.includes('London') ? 1.2 :
                              location.includes('Remote') ? 1.1 :
                              location.includes('India') || location.includes('Brazil') ? 0.7 : 1.0;

    const job = {
      title: template.title,
      description: template.description,
      full_description: `${template.description}

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
• Stay current with industry trends and best practices

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements
• Professional development opportunities`,
      location: location,
      company: company.name,
      department: template.department,
      seniority_level: template.seniority_level,
      required_skills: template.required_skills,
      preferred_skills: template.preferred_skills,
      salary_min: Math.round((template.salary_min * locationMultiplier) / 1000) * 1000,
      salary_max: Math.round((template.salary_max * locationMultiplier) / 1000) * 1000,
      employment_type: template.employment_type,
      remote_eligible: Math.random() > 0.6, // 40% chance
    };
    
    jobs.push(job);
  }
  
  return jobs;
}

async function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer synthetic-job-deployment',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deployJobs() {
  console.log('🚀 Starting synthetic job deployment...');
  
  // Get the deployment URL from command line args or use local
  const deploymentUrl = process.argv[2] || 'http://localhost:3000';
  const apiUrl = `${deploymentUrl}/api/admin/populate-jobs`;
  
  console.log(`🔗 Using API endpoint: ${apiUrl}`);
  
  // Generate jobs
  const jobs = generateJobs(120);
  console.log(`✅ Generated ${jobs.length} synthetic jobs`);
  
  // Split into batches
  const batchSize = 20;
  const batches = [];
  for (let i = 0; i < jobs.length; i += batchSize) {
    batches.push(jobs.slice(i, i + batchSize));
  }
  
  console.log(`📦 Split into ${batches.length} batches of ${batchSize}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`⏳ Processing batch ${i + 1}/${batches.length}...`);
    
    try {
      const data = JSON.stringify({ jobs: batch });
      const response = await makeRequest(apiUrl, data);
      
      if (response.status === 200) {
        console.log(`✅ Batch ${i + 1} successful: ${response.data.message || 'Jobs added'}`);
        successCount += batch.length;
      } else {
        console.error(`❌ Batch ${i + 1} failed: ${response.status}`);
        console.error(`Response:`, response.data);
        errorCount += batch.length;
      }
    } catch (error) {
      console.error(`❌ Batch ${i + 1} error:`, error.message);
      errorCount += batch.length;
    }
    
    // Small delay between batches
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 Deployment Summary:');
  console.log(`✅ Successfully deployed: ${successCount} jobs`);
  console.log(`❌ Failed to deploy: ${errorCount} jobs`);
  console.log(`📈 Success rate: ${((successCount / jobs.length) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log('\n🎉 Synthetic job deployment completed!');
  }
}

// Run the deployment
deployJobs().catch(console.error);