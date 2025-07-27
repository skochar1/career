# Scalability Analysis
## Overview

This report outlines the architectural and performance implications of scaling the current job matching platform beyond its current limits. It evaluates the system's ability to handle increasingly large datasets of job postings and user resumes, along with associated AI operations. The analysis assumes the current baseline is a PostgreSQL database hosted on Supabase.

---

## Key Components to Scale

1. **Resume/Profile Storage**  
2. **Job Postings Storage and Retrieval**  
3. **Match Score Computation and Querying**  
4. **Cleaning and Maintenance of Stale Data**  

---

## Current System

- **Database:** PostgreSQL (Supabase)
- **Matching:** Real-time on upload, unbatched, uncached
- **Storage Model:** Flat tables for jobs, users, and scores
- **Caching/Processing:** In-memory for small datasets only

This setup is functional for early-stage use but is not optimal for high-scale production workloads.

---

## Scalability Tiers and Considerations

### 1. Handling 500 Jobs

**Status:** Fully manageable with current system  
**Backend Impact:** Minimal  
**Frontend Impact:** Negligible  
**Trade-offs:** None required  

**Recommendation:** No architectural change required; use in-memory caching for scores and leverage Supabase PostgreSQL efficiently.

---

### 2. Handling 5,000 Jobs

**Status:** Usable, but filters and scoring begin to lag  
**Issues:**  
- Real-time match score computation becomes a bottleneck  
- Filtering large result sets slows down response times  
- Database read performance may degrade with concurrent users

**Trade-offs and Solutions:**  
- Introduce caching of match scores using Redis or in-memory data store  
- Move embedding comparison and match scoring to background jobs  
- Add indexing on filterable fields (e.g., location, job type)  
- Use pagination or infinite scroll on frontend to limit data rendered at once

---

### 3. Handling 500,000 Jobs

**Status:** Requires architectural change  
**Issues:**  
- PostgreSQL query performance deteriorates with large unindexed datasets  
- Memory limits prevent caching full job dataset  
- Realtime scoring is infeasible without preprocessing  

**Trade-offs and Solutions:**  
- Migrate job storage to a horizontally scalable system (e.g., Elasticsearch, BigQuery, or ClickHouse)  
- Store semantic embeddings separately in vector databases like Pinecone, Weaviate, or Qdrant  
- Precompute match scores or job clusters based on resume category or user intent  
- Batch load and filter scores by job segments (e.g., top N jobs by category)

---

### 4. Handling 5,000,000 Jobs

**Status:** Major re-architecture required  
**Issues:**  
- Full-text search and filtering via relational DBs no longer viable  
- Cannot load all jobs into memory or cache  
- Real-time scoring would take minutes even with batching  
- Daily stale data cleanup and deduplication becomes expensive

**Trade-offs and Solutions:**  
- Use hybrid storage:
  - **Relational DB (e.g., PostgreSQL or CockroachDB)** for user metadata and job metadata  
  - **Vector DB (e.g., Pinecone)** for embedding similarity search  
  - **Blob storage (e.g., S3)** for resume files  
- Perform scheduled background jobs for:
  - Pruning expired/stale jobs
  - Re-indexing jobs based on activity  
- Asynchronous scoring and ranking jobs via background workers or message queues (e.g., BullMQ, Kafka)
- Apply stream-based filters (e.g., category → location → salary) to reduce cardinality before matching  

---

## Stale Job Cleanup Strategy

As job listings grow:
- Maintain `created_at`, `last_seen_at`, and `source_url` fields
- Schedule daily jobs to:
  - Remove jobs past expiration or inactive for 30+ days
  - Deduplicate based on `title`, `company`, and `location`
  - Archive old listings into cold storage or separate archival table

---

## Summary of Trade-Offs

| Scale             | Challenge                      | Solution                                | Trade-Off                                    |
|------------------|-------------------------------|-----------------------------------------|----------------------------------------------|
| 5K jobs          | Filter + scoring latency       | Cache match scores                      | Higher memory usage                          |
| 500K jobs        | DB query limits                | Use vector DBs for scoring              | Increased complexity and infra cost          |
| 5M jobs          | Stale data + ranking slowness  | Background jobs and hybrid storage      | Latency in reflecting new data               |
| All scales       | Recalculating match scores     | Precompute and cache embeddings         | Invalidation logic adds complexity           |

---

## Conclusion

The current Supabase/PostgreSQL solution is sufficient for small-scale use but will not scale beyond tens of thousands of job listings without significant architectural changes. A hybrid model using relational databases for metadata, vector databases for semantic search, and message queues for asynchronous processing will be necessary to support growth beyond 100,000 listings. Caching, background processing, and efficient indexing must be prioritized to ensure responsiveness and reduce operational overhead.

