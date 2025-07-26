import { NextRequest, NextResponse } from 'next/server';
import { cache, getCacheKey } from '../../../lib/cache';
import { searchJobs, initializeSearchIndex, jobSearchEngine } from '../../../lib/search';
import { enhanceSearchQuery, buildSmartSearchTerms } from '../../../lib/smart-search';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let dbModule: any;
if (isProduction) {
  dbModule = require('../../../lib/database-postgres');
} else {
  dbModule = require('../../../lib/database');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 100);
    const offset = (page - 1) * limit;
    
    const location = searchParams.get('location');
    const seniority = searchParams.get('seniority_level');
    const department = searchParams.get('department');
    const remote = searchParams.get('remote_eligible') || searchParams.get('remote');
    const onsite = searchParams.get('onsite');
    const hybrid = searchParams.get('hybrid');
    const employmentType = searchParams.get('employment_type');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');
    const sessionId = searchParams.get('session_id');

    const queryParams = {
      page,
      limit,
      location,
      seniority,
      department,
      remote,
      onsite,
      hybrid,
      employmentType,
      sort,
      search,
      sessionId
    };

    const cacheKey = getCacheKey('jobs', queryParams);
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    let result: any;

    if (isProduction) {
      // PostgreSQL logic
      await dbModule.initializeDatabase();

      // Initialize search index if not ready
      if (!jobSearchEngine.isReady()) {
        const { rows: allJobs } = await dbModule.sql`SELECT * FROM jobs WHERE is_active = true`;
        const processedJobs = allJobs.map((job: any) => ({
          ...job,
          required_skills: JSON.parse(job.required_skills || '[]'),
          preferred_skills: job.preferred_skills ? JSON.parse(job.preferred_skills) : []
        }));
        initializeSearchIndex(processedJobs);
      }

      if (search && search.trim()) {
        result = await handleSmartSearchQueryPostgres(search, {
          limit,
          offset,
          sort,
          filters: {
            location: location || undefined,
            seniority_level: seniority || undefined,
            department: department || undefined,
            employment_type: employmentType || undefined,
            remote_eligible: remote === 'true' ? true : undefined,
            onsite: onsite === 'true' ? true : undefined,
            hybrid: hybrid === 'true' ? true : undefined
          }
        }, sessionId);
      } else {
        result = await handleRegularQueryPostgres({
          location,
          seniority,
          department,
          remote,
          onsite,
          hybrid,
          employmentType,
          sort,
          sessionId,
          limit,
          offset
        });
      }
    } else {
      // SQLite logic
      const db = dbModule.getDatabase();
      try {
        db.prepare('ALTER TABLE jobs ADD COLUMN full_description TEXT').run();
      } catch (e) {
        // Ignore error if column already exists
      }

      // Initialize search index if not ready
      if (!jobSearchEngine.isReady()) {
        const allJobs = db.prepare('SELECT * FROM jobs WHERE is_active = 1').all() as any[];
        const processedJobs = allJobs.map(job => ({
          ...job,
          required_skills: JSON.parse(job.required_skills || '[]'),
          preferred_skills: job.preferred_skills ? JSON.parse(job.preferred_skills) : []
        }));
        initializeSearchIndex(processedJobs);
      }

      if (search && search.trim()) {
        result = await handleSmartSearchQuery(search, {
          limit,
          offset,
          sort,
          filters: {
            location: location || undefined,
            seniority_level: seniority || undefined,
            department: department || undefined,
            employment_type: employmentType || undefined,
            remote_eligible: remote === 'true' ? true : undefined,
            onsite: onsite === 'true' ? true : undefined,
            hybrid: hybrid === 'true' ? true : undefined
          }
        }, sessionId, db);
      } else {
        result = await handleRegularQuery({
          location,
          seniority,
          department,
          remote,
          onsite,
          hybrid,
          employmentType,
          sort,
          sessionId,
          limit,
          offset
        }, db);
      }
    }

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error.message },
      { status: 500 }
    );
  }
}

async function handleSmartSearchQuery(
  searchQuery: string,
  options: any,
  sessionId: string | null,
  db: any
) {
  // Enhance the search query using OpenAI
  const enhancement = await enhanceSearchQuery(searchQuery);
  const enhancedQuery = buildSmartSearchTerms(searchQuery, enhancement);
  
  console.log('Original query:', searchQuery);
  console.log('Enhanced query:', enhancedQuery);
  console.log('Search enhancement:', enhancement);

  // Apply suggested filters if they're not already set
  const updatedFilters = { ...options.filters };
  
  if (enhancement.suggestedFilters.departments?.length && enhancement.suggestedFilters.departments.length > 0 && !updatedFilters.department) {
    // Use the first suggested department if none is already filtered
    updatedFilters.department = enhancement.suggestedFilters.departments[0];
  }
  
  if (enhancement.suggestedFilters.seniority && !updatedFilters.seniority_level) {
    updatedFilters.seniority_level = enhancement.suggestedFilters.seniority;
  }

  const searchResult = searchJobs(enhancedQuery, {
    ...options,
    filters: updatedFilters
  });
  
  let jobs = searchResult.results.map(doc => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    location: doc.location,
    company: doc.company,
    department: doc.department,
    seniority_level: doc.seniority_level,
    required_skills: doc.required_skills,
    preferred_skills: doc.preferred_skills,
    employment_type: doc.employment_type,
    created_at: new Date().toISOString(),
    match_score: 0
  }));

  if (sessionId && sessionId !== 'undefined') {
    jobs = await addMatchScores(jobs, sessionId, db);
    jobs.sort((a, b) => b.match_score - a.match_score);
  } else {
    // Apply sorting for non-personalized search
    jobs = applySorting(jobs, options.sort);
  }

  const total = searchResult.total;
  const { limit, offset } = options;

  return {
    jobs,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    },
    searchEnhancement: enhancement
  };
}


function getOrderByClause(sort?: string): string {
  switch (sort) {
    case 'date':
      return ' ORDER BY created_at DESC';
    case 'salary':
      return ' ORDER BY salary_max DESC, salary_min DESC';
    case 'company':
      return ' ORDER BY company ASC';
    case 'relevance':
    default:
      return ' ORDER BY created_at DESC';
  }
}

function applySorting(jobs: any[], sort?: string): any[] {
  if (!sort || sort === 'relevance') {
    return jobs; // Keep original order for relevance
  }

  const sortedJobs = [...jobs];
  
  switch (sort) {
    case 'date':
      return sortedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'salary':
      return sortedJobs.sort((a, b) => {
        const aSalary = a.salary_max || a.salary_min || 0;
        const bSalary = b.salary_max || b.salary_min || 0;
        return bSalary - aSalary;
      });
    case 'company':
      return sortedJobs.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    default:
      return sortedJobs;
  }
}

async function handleRegularQuery(params: any, db: any) {
  const { location, seniority, department, remote, onsite, hybrid, employmentType, sort, sessionId, limit, offset } = params;
  
  let whereConditions = ['is_active = 1'];
  let queryParams: any[] = [];

  if (location) {
    whereConditions.push('location LIKE ?');
    queryParams.push(`%${location}%`);
  }

  if (seniority) {
    whereConditions.push('seniority_level = ?');
    queryParams.push(seniority);
  }

  if (department) {
    // Handle multiple departments separated by commas
    const departments = department.split(',').map((d: string) => d.trim());
    const departmentConditions = departments.map(() => 'department LIKE ?').join(' OR ');
    whereConditions.push(`(${departmentConditions})`);
    departments.forEach((dept: string) => queryParams.push(`%${dept}%`));
  }

  if (employmentType) {
    // Handle multiple employment types separated by commas
    const types = employmentType.split(',').map((t: string) => t.trim().toLowerCase());
    const typeConditions = types.map(() => 'LOWER(employment_type) = ?').join(' OR ');
    whereConditions.push(`(${typeConditions})`);
    types.forEach((type: string) => queryParams.push(type));
  }

  // Handle work type filters
  const workTypeFilters: string[] = [];
  if (remote === 'true') {
    workTypeFilters.push('remote_eligible = 1');
  }
  if (onsite === 'true') {
    workTypeFilters.push('remote_eligible = 0');
  }
  if (hybrid === 'true') {
    // For hybrid, we might need to check for specific patterns or add a hybrid field
    // For now, assuming hybrid jobs might have "hybrid" in description or title
    workTypeFilters.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)');
    queryParams.push('%hybrid%', '%hybrid%');
  }
  
  if (workTypeFilters.length > 0) {
    whereConditions.push(`(${workTypeFilters.join(' OR ')})`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  let baseQuery = `
      SELECT 
        id, title, description, full_description, location, company, department, seniority_level,
        required_skills, preferred_skills, salary_min, salary_max,
        employment_type, remote_eligible, created_at
      FROM jobs 
      ${whereClause}
    `;


  if (sessionId && sessionId !== 'undefined') {
    const candidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);
    
    if (candidate && candidate.parsed_skills) {
      baseQuery = `
        SELECT 
          j.id, j.title, j.description, j.full_description, j.location, j.company, j.department, j.seniority_level,
          j.required_skills, j.preferred_skills, j.salary_min, j.salary_max,
          j.employment_type, j.remote_eligible, j.created_at,
          COALESCE(jm.match_score, 0) as match_score
        FROM jobs j
        LEFT JOIN job_matches jm ON j.id = jm.job_id AND jm.candidate_id = ?
        ${whereClause}
        ORDER BY COALESCE(jm.match_score, 0) DESC, j.created_at DESC
      `;
      queryParams.unshift(candidate.id);
    } else {
      baseQuery += getOrderByClause(sort);
    }
  } else {
    baseQuery += getOrderByClause(sort);
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM jobs 
    ${whereClause}
  `;

  const totalResult = sessionId && sessionId !== 'undefined' ? 
    db.prepare(countQuery).get(...queryParams.slice(1)) as { total: number } :
    db.prepare(countQuery).get(...queryParams) as { total: number };
  
  const total = totalResult.total;

  const jobsQuery = `${baseQuery} LIMIT ? OFFSET ?`;
  const jobs = db.prepare(jobsQuery).all(...queryParams, limit, offset) as any[];

  const processedJobs = jobs.map(job => ({
    ...job,
    required_skills: JSON.parse(job.required_skills || '[]'),
    preferred_skills: job.preferred_skills ? JSON.parse(job.preferred_skills) : [],
    match_score: (job as any).match_score || 0,
    full_description: job.full_description // <-- Make sure you add this
  }));

  return {
    jobs: processedJobs,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    }
  };
}

async function addMatchScores(jobs: any[], sessionId: string, db: any) {
  const candidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);
  
  if (!candidate) return jobs;

  const jobIds = jobs.map(job => job.id);
  const placeholders = jobIds.map(() => '?').join(',');
  
  const matches = db.prepare(`
    SELECT job_id, match_score 
    FROM job_matches 
    WHERE candidate_id = ? AND job_id IN (${placeholders})
  `).all(candidate.id, ...jobIds) as any[];

  const matchMap = new Map(matches.map(m => [m.job_id, m.match_score]));

  return jobs.map(job => ({
    ...job,
    match_score: matchMap.get(job.id) || 0
  }));
}

// PostgreSQL-specific handlers
async function handleSmartSearchQueryPostgres(
  searchQuery: string,
  options: any,
  sessionId: string | null
) {
  const enhancement = await enhanceSearchQuery(searchQuery);
  const enhancedQuery = buildSmartSearchTerms(searchQuery, enhancement);
  
  console.log('Original query:', searchQuery);
  console.log('Enhanced query:', enhancedQuery);
  console.log('Search enhancement:', enhancement);

  const updatedFilters = { ...options.filters };
  
  if (enhancement.suggestedFilters.departments?.length && enhancement.suggestedFilters.departments.length > 0 && !updatedFilters.department) {
    updatedFilters.department = enhancement.suggestedFilters.departments[0];
  }
  
  if (enhancement.suggestedFilters.seniority && !updatedFilters.seniority_level) {
    updatedFilters.seniority_level = enhancement.suggestedFilters.seniority;
  }

  const searchResult = searchJobs(enhancedQuery, {
    ...options,
    filters: updatedFilters
  });
  
  let jobs = searchResult.results.map(doc => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    location: doc.location,
    company: doc.company,
    department: doc.department,
    seniority_level: doc.seniority_level,
    required_skills: doc.required_skills,
    preferred_skills: doc.preferred_skills,
    employment_type: doc.employment_type,
    remote_eligible: doc.remote_eligible,
    salary_min: null,
    salary_max: null,
    created_at: new Date().toISOString(),
    match_score: 0
  }));

  if (sessionId && sessionId !== 'undefined') {
    jobs = await addMatchScoresPostgres(jobs, sessionId);
    jobs.sort((a, b) => b.match_score - a.match_score);
  } else {
    jobs = applySorting(jobs, options.sort);
  }

  const total = searchResult.total;
  const { limit, offset } = options;

  return {
    jobs,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    },
    searchEnhancement: enhancement
  };
}

async function handleRegularQueryPostgres(params: any) {
  const { location, seniority, department, remote, onsite, hybrid, employmentType, sort, sessionId, limit, offset } = params;
  
  let whereConditions = ['is_active = true'];
  let queryValues: any[] = [];
  let paramIndex = 1;

  if (location) {
    whereConditions.push(`location ILIKE $${paramIndex}`);
    queryValues.push(`%${location}%`);
    paramIndex++;
  }

  if (seniority) {
    whereConditions.push(`seniority_level = $${paramIndex}`);
    queryValues.push(seniority);
    paramIndex++;
  }

  if (department) {
    const departments = department.split(',').map((d: string) => d.trim());
    const departmentConditions = departments.map((_, i) => `department ILIKE $${paramIndex + i}`).join(' OR ');
    whereConditions.push(`(${departmentConditions})`);
    departments.forEach((dept: string) => queryValues.push(`%${dept}%`));
    paramIndex += departments.length;
  }

  if (employmentType) {
    const types = employmentType.split(',').map((t: string) => t.trim().toLowerCase());
    const typeConditions = types.map((_, i) => `LOWER(employment_type) = $${paramIndex + i}`).join(' OR ');
    whereConditions.push(`(${typeConditions})`);
    types.forEach((type: string) => queryValues.push(type));
    paramIndex += types.length;
  }

  const workTypeFilters: string[] = [];
  if (remote === 'true') {
    workTypeFilters.push('remote_eligible = true');
  }
  if (onsite === 'true') {
    workTypeFilters.push('remote_eligible = false');
  }
  if (hybrid === 'true') {
    workTypeFilters.push(`(LOWER(title) ILIKE $${paramIndex} OR LOWER(description) ILIKE $${paramIndex + 1})`);
    queryValues.push('%hybrid%', '%hybrid%');
    paramIndex += 2;
  }
  
  if (workTypeFilters.length > 0) {
    whereConditions.push(`(${workTypeFilters.join(' OR ')})`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderClause = getOrderByClause(sort);

  let baseQuery = `
    SELECT 
      id, title, description, full_description, location, company, department, seniority_level,
      required_skills, preferred_skills, salary_min, salary_max,
      employment_type, remote_eligible, created_at
    FROM jobs 
    ${whereClause}
  `;

  if (sessionId && sessionId !== 'undefined') {
    const { rows: candidates } = await dbModule.sql`SELECT * FROM candidates WHERE session_id = ${sessionId}`;
    const candidate = candidates[0];
    
    if (candidate && candidate.parsed_skills) {
      baseQuery = `
        SELECT 
          j.id, j.title, j.description, j.full_description, j.location, j.company, j.department, j.seniority_level,
          j.required_skills, j.preferred_skills, j.salary_min, j.salary_max,
          j.employment_type, j.remote_eligible, j.created_at,
          COALESCE(jm.match_score, 0) as match_score
        FROM jobs j
        LEFT JOIN job_matches jm ON j.id = jm.job_id AND jm.candidate_id = ${candidate.id}
        ${whereClause}
        ORDER BY COALESCE(jm.match_score, 0) DESC, j.created_at DESC
      `;
    } else {
      baseQuery += orderClause;
    }
  } else {
    baseQuery += orderClause;
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM jobs 
    ${whereClause}
  `;

  const { rows: totalResult } = await dbModule.sql.query(countQuery, queryValues);
  const total = parseInt(totalResult[0].total);

  queryValues.push(limit, offset);
  const jobsQuery = `${baseQuery} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  const { rows: jobs } = await dbModule.sql.query(jobsQuery, queryValues);

  const processedJobs = jobs.map((job: any) => ({
    ...job,
    required_skills: JSON.parse(job.required_skills || '[]'),
    preferred_skills: job.preferred_skills ? JSON.parse(job.preferred_skills) : [],
    match_score: job.match_score || 0,
    remote_eligible: job.remote_eligible ? 1 : 0
  }));

  return {
    jobs: processedJobs,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    }
  };
}

async function addMatchScoresPostgres(jobs: any[], sessionId: string) {
  const { rows: candidates } = await dbModule.sql`SELECT * FROM candidates WHERE session_id = ${sessionId}`;
  const candidate = candidates[0];
  
  if (!candidate) return jobs;

  const jobIds = jobs.map(job => job.id);
  const { rows: matches } = await dbModule.sql`
    SELECT job_id, match_score 
    FROM job_matches 
    WHERE candidate_id = ${candidate.id} AND job_id = ANY(${jobIds})
  `;

  const matchMap = new Map(matches.map((m: any) => [m.job_id, m.match_score]));

  return jobs.map(job => ({
    ...job,
    match_score: matchMap.get(job.id) || 0
  }));
}