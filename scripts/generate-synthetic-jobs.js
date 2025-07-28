#!/usr/bin/env ts-node
"use strict";
/**
 * Synthetic Job Data Generator
 * Creates diverse job listings covering all filter categories and international locations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSyntheticJobs = generateSyntheticJobs;
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
const jobTemplates = [
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
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function generateJobs(count) {
    const jobs = [];
    for (let i = 0; i < count; i++) {
        const template = getRandomElement(jobTemplates);
        const company = getRandomElement(companies);
        const location = getRandomElement(company.locations);
        // Add some variability to salaries based on location
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
            department: template.department,
            seniority_level: template.seniority_level,
            required_skills: template.required_skills,
            preferred_skills: template.preferred_skills,
            salary_min: Math.round((template.salary_min * locationMultiplier) / 1000) * 1000,
            salary_max: Math.round((template.salary_max * locationMultiplier) / 1000) * 1000,
            employment_type: template.employment_type,
            remote_eligible: template.remote_eligible ?? (Math.random() > 0.6), // 40% chance of remote
        };
        jobs.push(job);
    }
    return jobs;
}
// Additional companies for more diversity
const additionalCompanies = [
    { name: 'Tesla', locations: ['Austin, TX', 'Fremont, CA', 'Berlin, Germany', 'Shanghai, China'] },
    { name: 'SpaceX', locations: ['Hawthorne, CA', 'Boca Chica, TX', 'Cape Canaveral, FL'] },
    { name: 'ByteDance', locations: ['Beijing, China', 'Singapore', 'London, UK', 'Los Angeles, CA'] },
    { name: 'Zoom', locations: ['San Jose, CA', 'Austin, TX', 'Denver, CO', 'Remote'] },
    { name: 'Slack', locations: ['San Francisco, CA', 'Vancouver, Canada', 'Dublin, Ireland', 'Tokyo, Japan'] },
    { name: 'Palantir', locations: ['Denver, CO', 'Palo Alto, CA', 'London, UK', 'Washington, DC'] },
    { name: 'Snowflake', locations: ['San Mateo, CA', 'Bellevue, WA', 'Dublin, Ireland'] },
    { name: 'Databricks', locations: ['San Francisco, CA', 'Amsterdam, Netherlands', 'Singapore'] },
    { name: 'Coinbase', locations: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Remote'] },
    { name: 'OpenAI', locations: ['San Francisco, CA', 'London, UK', 'Remote'] },
    { name: 'Anthropic', locations: ['San Francisco, CA', 'London, UK', 'Remote'] },
    { name: 'Canva', locations: ['Sydney, Australia', 'Manila, Philippines', 'Austin, TX'] },
    { name: 'Figma', locations: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Remote'] },
    { name: 'Discord', locations: ['San Francisco, CA', 'Austin, TX', 'Remote'] },
    { name: 'Roblox', locations: ['San Mateo, CA', 'Austin, TX', 'London, UK'] },
    { name: 'Unity', locations: ['San Francisco, CA', 'Austin, TX', 'Copenhagen, Denmark', 'Montreal, Canada'] },
    { name: 'Epic Games', locations: ['Cary, NC', 'Seattle, WA', 'London, UK', 'Berlin, Germany'] },
    { name: 'Riot Games', locations: ['Los Angeles, CA', 'Dublin, Ireland', 'Singapore', 'São Paulo, Brazil'] },
    { name: 'ServiceNow', locations: ['Santa Clara, CA', 'San Diego, CA', 'Amsterdam, Netherlands'] },
    { name: 'Workday', locations: ['Pleasanton, CA', 'Atlanta, GA', 'Dublin, Ireland', 'Vancouver, Canada'] },
    { name: 'MongoDB', locations: ['New York, NY', 'Austin, TX', 'London, UK', 'Sydney, Australia'] },
    { name: 'Elastic', locations: ['Amsterdam, Netherlands', 'Mountain View, CA', 'London, UK', 'Remote'] },
    { name: 'GitLab', locations: ['Remote', 'San Francisco, CA'] },
    { name: 'HashiCorp', locations: ['San Francisco, CA', 'Austin, TX', 'London, UK', 'Remote'] },
    { name: 'Twilio', locations: ['San Francisco, CA', 'Denver, CO', 'London, UK', 'Singapore'] },
    { name: 'Okta', locations: ['San Francisco, CA', 'Bellevue, WA', 'Toronto, Canada', 'London, UK'] },
    { name: 'Zscaler', locations: ['San Jose, CA', 'Austin, TX', 'London, UK', 'Bangalore, India'] },
    { name: 'CrowdStrike', locations: ['Austin, TX', 'Sunnyvale, CA', 'London, UK', 'Remote'] },
    { name: 'Palo Alto Networks', locations: ['Santa Clara, CA', 'Austin, TX', 'Tel Aviv, Israel', 'Amsterdam, Netherlands'] },
    { name: 'ServiceTitan', locations: ['Glendale, CA', 'Atlanta, GA', 'Remote'] },
];
// More job templates for comprehensive coverage
const additionalJobTemplates = [
    // More Engineering roles
    {
        title: 'Staff Software Engineer',
        department: 'Engineering',
        seniority_level: 'lead',
        employment_type: 'full-time',
        description: 'Lead technical architecture decisions and mentor engineering teams. Drive complex technical initiatives across multiple product areas.',
        required_skills: ['System Design', 'Technical Leadership', 'Software Architecture', 'Mentoring'],
        preferred_skills: ['Distributed Systems', 'Cloud Platforms', 'Performance Optimization'],
        salary_min: 200000,
        salary_max: 300000,
    },
    {
        title: 'Site Reliability Engineer',
        department: 'Engineering',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Ensure system reliability, scalability, and performance. Build automation tools and monitoring systems.',
        required_skills: ['Kubernetes', 'Docker', 'Monitoring', 'Linux', 'Python'],
        preferred_skills: ['Terraform', 'Prometheus', 'Grafana', 'Incident Response'],
        salary_min: 140000,
        salary_max: 190000,
    },
    {
        title: 'Security Engineer',
        department: 'Engineering',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Design and implement security measures to protect company infrastructure and data.',
        required_skills: ['Cybersecurity', 'Network Security', 'Penetration Testing', 'Security Auditing'],
        preferred_skills: ['CISSP', 'Threat Modeling', 'Incident Response', 'Compliance'],
        salary_min: 130000,
        salary_max: 180000,
    },
    {
        title: 'Frontend Engineering Intern',
        department: 'Engineering',
        seniority_level: 'junior',
        employment_type: 'internship',
        description: '12-week summer internship program. Work on real frontend projects with mentorship from senior engineers.',
        required_skills: ['JavaScript', 'HTML', 'CSS', 'Git'],
        preferred_skills: ['React', 'TypeScript', 'Responsive Design'],
        salary_min: 6000,
        salary_max: 9000,
    },
    {
        title: 'Contract Backend Developer',
        department: 'Engineering',
        seniority_level: 'mid',
        employment_type: 'contract',
        description: '6-month contract position to build microservices architecture. Remote-friendly with flexible hours.',
        required_skills: ['Node.js', 'Python', 'API Development', 'Database Design'],
        preferred_skills: ['GraphQL', 'Microservices', 'Cloud Platforms'],
        salary_min: 80,
        salary_max: 120,
        remote_eligible: true,
    },
    // Healthcare & Life Sciences
    {
        title: 'Healthcare Data Scientist',
        department: 'Healthcare',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Apply machine learning to healthcare data to improve patient outcomes. Work with clinical teams and researchers.',
        required_skills: ['Python', 'Machine Learning', 'Healthcare Data', 'Statistics', 'HIPAA'],
        preferred_skills: ['TensorFlow', 'Clinical Research', 'Bioinformatics', 'EHR Systems'],
        salary_min: 140000,
        salary_max: 190000,
    },
    {
        title: 'Clinical Research Associate',
        department: 'Healthcare',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Monitor clinical trials and ensure compliance with regulatory standards. Travel to investigational sites.',
        required_skills: ['Clinical Research', 'GCP', 'FDA Regulations', 'Medical Terminology'],
        preferred_skills: ['Pharmacovigilance', 'EDC Systems', 'ICH Guidelines'],
        salary_min: 75000,
        salary_max: 105000,
    },
    {
        title: 'Biomedical Engineer',
        department: 'Healthcare',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Design and develop medical devices and equipment. Collaborate with healthcare professionals and regulatory teams.',
        required_skills: ['Biomedical Engineering', 'CAD Software', 'FDA Regulations', 'Medical Devices'],
        preferred_skills: ['MATLAB', 'Regulatory Affairs', 'Quality Systems'],
        salary_min: 80000,
        salary_max: 120000,
    },
    {
        title: 'Part-time Telemedicine Coordinator',
        department: 'Healthcare',
        seniority_level: 'mid',
        employment_type: 'part-time',
        description: 'Coordinate virtual healthcare appointments and support telehealth operations. 20-25 hours per week.',
        required_skills: ['Healthcare Administration', 'Telemedicine', 'EMR Systems', 'Patient Care'],
        preferred_skills: ['Healthcare IT', 'Customer Service', 'HIPAA Compliance'],
        salary_min: 35000,
        salary_max: 50000,
        remote_eligible: true,
    },
    // Finance & Fintech
    {
        title: 'Quantitative Analyst',
        department: 'Finance',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Develop mathematical models for trading strategies and risk management. Work with large financial datasets.',
        required_skills: ['Python', 'R', 'Financial Modeling', 'Statistics', 'Machine Learning'],
        preferred_skills: ['C++', 'Options Pricing', 'Risk Management', 'Bloomberg API'],
        salary_min: 150000,
        salary_max: 250000,
    },
    {
        title: 'Cryptocurrency Analyst',
        department: 'Finance',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Analyze cryptocurrency markets and blockchain technologies. Provide investment recommendations and market insights.',
        required_skills: ['Blockchain Technology', 'Cryptocurrency', 'Financial Analysis', 'Market Research'],
        preferred_skills: ['DeFi', 'Smart Contracts', 'Technical Analysis', 'Python'],
        salary_min: 90000,
        salary_max: 140000,
    },
    {
        title: 'Risk Management Intern',
        department: 'Finance',
        seniority_level: 'junior',
        employment_type: 'internship',
        description: 'Support risk assessment and compliance activities. Learn about financial risk management and regulatory requirements.',
        required_skills: ['Excel', 'Financial Analysis', 'Risk Assessment'],
        preferred_skills: ['Python', 'Statistics', 'Regulatory Knowledge'],
        salary_min: 4000,
        salary_max: 6000,
    },
    {
        title: 'Freelance Financial Consultant',
        department: 'Finance',
        seniority_level: 'senior',
        employment_type: 'contract',
        description: 'Provide financial planning and analysis services to startups and small businesses. Project-based work.',
        required_skills: ['Financial Planning', 'FP&A', 'Business Analysis', 'Excel'],
        preferred_skills: ['Startup Experience', 'Fundraising', 'Financial Modeling'],
        salary_min: 100,
        salary_max: 200,
        remote_eligible: true,
    },
    // Creative & Media
    {
        title: 'Creative Director',
        department: 'Design',
        seniority_level: 'vp',
        employment_type: 'full-time',
        description: 'Lead creative vision and strategy across all brand touchpoints. Manage a team of designers and creative professionals.',
        required_skills: ['Creative Direction', 'Brand Strategy', 'Team Leadership', 'Design Systems'],
        preferred_skills: ['Agency Experience', 'Campaign Development', 'Brand Guidelines'],
        salary_min: 160000,
        salary_max: 250000,
    },
    {
        title: 'Motion Graphics Designer',
        department: 'Design',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Create animated graphics and video content for marketing campaigns and product demos.',
        required_skills: ['After Effects', 'Motion Graphics', 'Animation', 'Video Editing'],
        preferred_skills: ['Cinema 4D', 'Illustrator', 'Storyboarding'],
        salary_min: 70000,
        salary_max: 100000,
    },
    {
        title: 'Contract Video Editor',
        department: 'Design',
        seniority_level: 'mid',
        employment_type: 'contract',
        description: 'Edit marketing videos, product demos, and social media content. Flexible remote work arrangement.',
        required_skills: ['Video Editing', 'Adobe Premiere', 'Final Cut Pro', 'Color Correction'],
        preferred_skills: ['Motion Graphics', 'Audio Editing', 'YouTube Optimization'],
        salary_min: 50,
        salary_max: 85,
        remote_eligible: true,
    },
    // Education & Training
    {
        title: 'Technical Writing Manager',
        department: 'Education',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Lead documentation strategy and manage technical writing team. Create developer documentation and user guides.',
        required_skills: ['Technical Writing', 'Documentation Strategy', 'API Documentation', 'Team Management'],
        preferred_skills: ['Developer Tools', 'Markdown', 'Git', 'Information Architecture'],
        salary_min: 120000,
        salary_max: 160000,
    },
    {
        title: 'E-learning Developer',
        department: 'Education',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Design and develop interactive online learning experiences. Work with subject matter experts and instructional designers.',
        required_skills: ['E-learning Development', 'LMS', 'Instructional Design', 'HTML/CSS'],
        preferred_skills: ['Articulate Storyline', 'JavaScript', 'SCORM', 'Adult Learning Theory'],
        salary_min: 65000,
        salary_max: 90000,
    },
    // Customer Success & Support
    {
        title: 'Customer Success Manager',
        department: 'Sales',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Drive customer adoption and retention. Work with enterprise clients to ensure successful onboarding and ongoing success.',
        required_skills: ['Customer Success', 'Account Management', 'SaaS', 'Data Analysis'],
        preferred_skills: ['Enterprise Software', 'Onboarding', 'Churn Reduction'],
        salary_min: 80000,
        salary_max: 120000,
    },
    {
        title: 'Technical Support Engineer',
        department: 'Operations',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Provide technical support to customers and troubleshoot complex technical issues. Work with engineering teams on escalations.',
        required_skills: ['Technical Support', 'Troubleshooting', 'Customer Communication', 'API Knowledge'],
        preferred_skills: ['SQL', 'Linux', 'Networking', 'Cloud Platforms'],
        salary_min: 70000,
        salary_max: 95000,
    },
    // Legal & Compliance
    {
        title: 'Privacy Counsel',
        department: 'Legal',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Provide legal counsel on privacy and data protection matters. Ensure GDPR, CCPA, and other privacy law compliance.',
        required_skills: ['Privacy Law', 'GDPR', 'CCPA', 'Legal Counsel', 'Compliance'],
        preferred_skills: ['Technology Law', 'Risk Assessment', 'Policy Development'],
        salary_min: 160000,
        salary_max: 220000,
    },
    {
        title: 'Compliance Analyst',
        department: 'Legal',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Monitor regulatory compliance and conduct risk assessments. Support audit activities and policy development.',
        required_skills: ['Regulatory Compliance', 'Risk Assessment', 'Audit Support', 'Policy Development'],
        preferred_skills: ['Financial Regulations', 'SOX Compliance', 'Data Analysis'],
        salary_min: 65000,
        salary_max: 90000,
    },
    // Human Resources
    {
        title: 'Talent Acquisition Partner',
        department: 'Human Resources',
        seniority_level: 'mid',
        employment_type: 'full-time',
        description: 'Lead full-cycle recruiting for technical and non-technical roles. Build talent pipelines and improve hiring processes.',
        required_skills: ['Recruiting', 'Talent Acquisition', 'Interviewing', 'ATS Systems'],
        preferred_skills: ['Technical Recruiting', 'Employer Branding', 'Diversity Hiring'],
        salary_min: 75000,
        salary_max: 110000,
    },
    {
        title: 'People Operations Manager',
        department: 'Human Resources',
        seniority_level: 'senior',
        employment_type: 'full-time',
        description: 'Design and implement people programs that support company culture and employee experience.',
        required_skills: ['People Operations', 'HR Strategy', 'Employee Experience', 'Program Management'],
        preferred_skills: ['HRIS Systems', 'Change Management', 'Performance Management'],
        salary_min: 100000,
        salary_max: 140000,
    },
    // More international and remote-first roles
    {
        title: 'Remote Social Media Specialist',
        department: 'Marketing',
        seniority_level: 'junior',
        employment_type: 'full-time',
        description: 'Manage social media presence across multiple platforms. Create content and engage with community members worldwide.',
        required_skills: ['Social Media Marketing', 'Content Creation', 'Community Management', 'Analytics'],
        preferred_skills: ['Video Editing', 'Influencer Relations', 'Paid Social', 'Multi-language Support'],
        salary_min: 45000,
        salary_max: 65000,
        remote_eligible: true,
    },
    {
        title: 'Global Sales Development Representative',
        department: 'Sales',
        seniority_level: 'junior',
        employment_type: 'full-time',
        description: 'Generate leads across international markets. Work with prospects in EMEA, APAC, and Americas regions.',
        required_skills: ['Lead Generation', 'International Sales', 'CRM', 'Multi-language Communication'],
        preferred_skills: ['Salesforce', 'Outbound Prospecting', 'Cultural Awareness'],
        salary_min: 50000,
        salary_max: 75000,
        remote_eligible: true,
    }
];
// Combine all companies and job templates
const allCompanies = [...companies, ...additionalCompanies];
const allJobTemplates = [...jobTemplates, ...additionalJobTemplates];
// Enhanced job generation with better variety
function generateEnhancedJobs(count) {
    const jobs = [];
    const usedCombinations = new Set();
    for (let i = 0; i < count; i++) {
        let attempts = 0;
        let job = null;
        let combinationKey;
        do {
            const template = getRandomElement(allJobTemplates);
            const company = getRandomElement(allCompanies);
            const location = getRandomElement(company.locations);
            combinationKey = `${template.title}-${company.name}-${location}`;
            attempts++;
            if (attempts > 50)
                break; // Avoid infinite loop
            // Add variety to employment types and seniority levels
            const employmentTypes = ['full-time', 'part-time', 'contract', 'internship'];
            const senioryLevels = ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'];
            // Occasionally randomize employment type and seniority for more variety
            const employmentType = Math.random() < 0.1 ? getRandomElement(employmentTypes) : template.employment_type;
            const seniorityLevel = Math.random() < 0.05 ? getRandomElement(senioryLevels) : template.seniority_level;
            // Adjust salary based on location, employment type, and seniority
            let locationMultiplier = 1.0;
            if (location.includes('San Francisco') || location.includes('New York') || location.includes('Zurich'))
                locationMultiplier = 1.3;
            else if (location.includes('London') || location.includes('Tokyo') || location.includes('Sydney'))
                locationMultiplier = 1.2;
            else if (location.includes('Dublin') || location.includes('Amsterdam') || location.includes('Toronto'))
                locationMultiplier = 1.1;
            else if (location.includes('Remote'))
                locationMultiplier = 1.05;
            else if (location.includes('India') || location.includes('Brazil') || location.includes('Philippines'))
                locationMultiplier = 0.6;
            else if (location.includes('Germany') || location.includes('Sweden') || location.includes('Canada'))
                locationMultiplier = 0.95;
            // Employment type salary adjustments
            let employmentMultiplier = 1.0;
            if (employmentType === 'part-time')
                employmentMultiplier = 0.6;
            else if (employmentType === 'contract')
                employmentMultiplier = 1.2; // Higher hourly rate
            else if (employmentType === 'internship')
                employmentMultiplier = 0.3;
            // Seniority adjustments
            let seniorityMultiplier = 1.0;
            if (seniorityLevel === 'junior')
                seniorityMultiplier = 0.8;
            else if (seniorityLevel === 'mid')
                seniorityMultiplier = 1.0;
            else if (seniorityLevel === 'senior')
                seniorityMultiplier = 1.3;
            else if (seniorityLevel === 'lead')
                seniorityMultiplier = 1.6;
            else if (seniorityLevel === 'vp')
                seniorityMultiplier = 2.0;
            else if (seniorityLevel === 'executive')
                seniorityMultiplier = 2.5;
            const totalMultiplier = locationMultiplier * employmentMultiplier * seniorityMultiplier;
            job = {
                title: `${template.title}${seniorityLevel !== template.seniority_level ? ` (${seniorityLevel} level)` : ''}`,
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
                                                template.department === 'Legal' ? 'Provide legal counsel and ensure compliance' :
                                                    template.department === 'Human Resources' ? 'Support people operations and talent management' :
                                                        'Contribute to team goals and company success'}
• Collaborate with cross-functional teams
• Participate in planning and strategy sessions
${seniorityLevel === 'senior' || seniorityLevel === 'lead' || seniorityLevel === 'vp' ? '• Mentor junior team members' : ''}
• Stay current with industry trends and best practices

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
${location === 'Remote' || Math.random() > 0.4 ? '• Flexible work arrangements and remote options' : '• Modern office environment'}
• Professional development opportunities
• Generous PTO and parental leave
• Company-sponsored learning and conferences
${location.includes('Europe') ? '• European work-life balance culture' : ''}
${location.includes('Asia') ? '• Opportunity to work in dynamic Asian markets' : ''}`,
                location: location,
                company: company.name,
                department: template.department,
                seniority_level: seniorityLevel,
                required_skills: template.required_skills,
                preferred_skills: template.preferred_skills,
                salary_min: Math.round((template.salary_min * totalMultiplier) / 1000) * 1000,
                salary_max: Math.round((template.salary_max * totalMultiplier) / 1000) * 1000,
                employment_type: employmentType,
                remote_eligible: template.remote_eligible ?? (location === 'Remote' || Math.random() > 0.5),
            };
        } while (usedCombinations.has(combinationKey) && attempts < 50);
        if (attempts < 50 && job) {
            usedCombinations.add(combinationKey);
            jobs.push(job);
        }
    }
    return jobs;
}
// Generate the synthetic data
function generateSyntheticJobs() {
    console.log('🚀 Generating comprehensive synthetic job data...');
    // Generate 500+ diverse jobs for comprehensive coverage
    const syntheticJobs = generateEnhancedJobs(500);
    console.log(`✅ Generated ${syntheticJobs.length} synthetic jobs`);
    console.log('📊 Coverage:');
    // Log coverage statistics
    const departments = [...new Set(syntheticJobs.map(j => j.department))];
    const locations = [...new Set(syntheticJobs.map(j => j.location))];
    const seniorities = [...new Set(syntheticJobs.map(j => j.seniority_level))];
    const employmentTypes = [...new Set(syntheticJobs.map(j => j.employment_type))];
    const companies = [...new Set(syntheticJobs.map(j => j.company))];
    console.log(`  • Departments: ${departments.length} (${departments.join(', ')})`);
    console.log(`  • Companies: ${companies.length} global companies`);
    console.log(`  • Locations: ${locations.length} global locations`);
    console.log(`  • Seniority levels: ${seniorities.length} (${seniorities.join(', ')})`);
    console.log(`  • Employment types: ${employmentTypes.length} (${employmentTypes.join(', ')})`);
    console.log(`  • Remote eligible: ${syntheticJobs.filter(j => j.remote_eligible).length} jobs`);
    console.log(`  • Salary range: $${Math.min(...syntheticJobs.map(j => j.salary_min)).toLocaleString()} - $${Math.max(...syntheticJobs.map(j => j.salary_max)).toLocaleString()}`);
    return syntheticJobs;
}
// For direct execution
if (require.main === module) {
    const jobs = generateSyntheticJobs();
    console.log('\n📝 Sample job:');
    console.log(JSON.stringify(jobs[0], null, 2));
}
