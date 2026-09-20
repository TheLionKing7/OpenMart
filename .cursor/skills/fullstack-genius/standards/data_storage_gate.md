# Hardened Multi-Database Storage Standards

## 1. Supabase (PostgreSQL) Optimization
- **Mandatory Connection Pooling**: All serverless routes (Next.js, Lambda, Edge) must connect to Supabase via the Transaction connection pool string (port `6543`), never the direct database port (`5432`).
- **Row Level Security (RLS)**: Every database migration table must explicitly execute `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. 
- **Indexing Requirement**: Every single `WHERE` clause or join key must possess a corresponding PostgreSQL index to minimize CPU usage on the free tier.

## 2. MongoDB & Mongoose Architecture
- **Global Connection Caching**: Code executing on serverless runtimes or microservices must reuse the cached MongoDB client instance. Never call `mongoose.connect()` per request.
- **Strict Schema Definitions**: Enable `strict: true` in Mongoose to prevent unstructured document bloating. 
- **Cursor Streaming**: For data processes pulling >50 documents, stream the data using cursors. Do not use `.find()` into a single in-memory array, which will trip Render’s low memory constraints.
