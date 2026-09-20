# Frontend Architecture & R2 CDN Standards

## 1. Asset Delivery Optimization via Cloudflare R2
- **Zero Raw File Serving**: Never serve large media files directly from the Render or Railway web server disk. All media must route through Cloudflare R2.
- **S3 Compatibility Layer**: Use `@aws-sdk/client-s3` with explicit `endpoint` mapping to your R2 bucket.
- **Signed URLs for Security**: Private file requests must utilize short-lived presigned URLs (`getSignedUrl`) generated inside Next.js Server Actions. Never expose raw bucket credentials.

## 2. Next.js App Router Architecture
- **Caching & ISR**: Implement Incremental Static Regeneration (`revalidate`) for read-heavy public pages to save database compute cycles on Supabase/MongoDB.
- **Server Action Boundaries**: Secure all Server Actions with strict validation schemas (Zod). Wrap data calls in explicit try/catch loops to handle downstream database cold starts cleanly.
