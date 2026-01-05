# Deployment Guide

## Railway Deployment

This project is configured to deploy on Railway.

### Prerequisites

1. Railway account
2. Neon PostgreSQL database
3. Google OAuth credentials

### Setup Steps

1. **Create Railway Project:**
   - Connect your GitHub repository
   - Railway will detect the monorepo structure

2. **Set Environment Variables:**

   For API service:
   ```
   DATABASE_URL=your_neon_connection_string
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   For Web service:
   ```
   VITE_API_URL=https://your-api.railway.app
   ```

   For MCP service:
   ```
   GEMINI_API_KEY=your_gemini_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX=raktamarga
   PORT=3001
   ```

3. **Database Setup:**
   - Create Neon PostgreSQL database
   - Run migrations:
     ```bash
     cd packages/db
     bun run db:migrate
     ```

4. **Deploy:**
   - Railway will automatically build and deploy on push to main branch
   - Or manually trigger deployment from Railway dashboard

### Free Tier Limits

- **Railway:** $1/month free credits (sufficient for MVP)
- **Neon:** 0.5 GB storage, 100 CU hours
- **Cloudflare R2:** 10 GB storage, unlimited egress
- **Resend:** 3,000 emails/month

### Monitoring

- Check Railway logs for deployment status
- Monitor database usage in Neon dashboard
- Set up alerts for resource limits
