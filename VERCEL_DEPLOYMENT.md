# Deploying Payload CMS to Vercel

This guide walks through deploying this multi-tenant Payload CMS application to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with this repository
- PostgreSQL database (Neon, Supabase, or AWS RDS)
- Vercel Blob account (optional, for file storage)

## Step 1: Prepare Your Database

### Option A: PostgreSQL (Recommended)

1. Create a PostgreSQL database on:
   - **Neon** (free): https://console.neon.tech
   - **Supabase** (free): https://supabase.com
   - **AWS RDS** (paid): https://aws.amazon.com/rds

2. Get your connection string (format: `postgresql://user:password@host:port/dbname`)

### Option B: MongoDB

1. Create a cluster on MongoDB Atlas (free tier available): https://www.mongodb.com/cloud/atlas
2. Get your connection string (format: `mongodb+srv://user:password@cluster.mongodb.net/dbname`)

## Step 2: Setup File Storage (Optional)

For persistent file uploads on Vercel, setup Vercel Blob:

1. Go to: https://vercel.com/docs/storage/vercel-blob
2. Create a new Blob store
3. Get your `BLOB_READ_WRITE_TOKEN`

Without this, uploads will be stored in temporary storage and lost on redeployment.

## Step 3: Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "chore: prepare for Vercel deployment"
   git push origin main
   ```

2. Go to https://vercel.com/new
3. Select your GitHub repository
4. Vercel auto-detects Next.js configuration
5. Click "Environment Variables" and add:
   - `DATABASE_ADAPTER` = `postgres` (or `mongodb`)
   - `DATABASE_URL` = your database connection string
   - `PAYLOAD_SECRET` = generate with: `openssl rand -base64 32`
   - `PAYLOAD_PUBLIC_SERVER_URL` = your Vercel URL (e.g., `https://my-app.vercel.app`)
   - `BLOB_READ_WRITE_TOKEN` = (optional, for file uploads)
   - `SEED_DB` = `true` (only for first deploy, then set to `false`)

6. Click "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables when prompted
```

## Step 4: Configure Environment Variables on Vercel

After deployment, go to your Vercel project settings:

1. Settings → Environment Variables
2. Add all variables from `.env.example`:
   - Database credentials
   - `PAYLOAD_SECRET`
   - `PAYLOAD_PUBLIC_SERVER_URL`
   - `BLOB_READ_WRITE_TOKEN` (if using Blob)

3. Re-deploy for variables to take effect

## Step 5: First Deploy & Seed

On your first deployment:

1. Set `SEED_DB=true` to populate initial data
2. Deploy and wait for it to complete
3. Go to `https://your-app.vercel.app/admin`
4. Login with: `demo@payloadcms.com` / `demo`
5. After confirming data is seeded, set `SEED_DB=false` and redeploy

## Step 6: Access Your CMS

- Admin panel: `https://your-app.vercel.app/admin`
- API: `https://your-app.vercel.app/api`
- GraphQL: `https://your-app.vercel.app/api/graphql`

## Troubleshooting

### Database Connection Issues

1. Check connection string format
2. Ensure database accepts connections from Vercel IP ranges
3. For PostgreSQL: allow all IPs (Vercel doesn't have fixed IPs)
4. Check logs: `vercel logs <project-name>`

### Build Failures

```bash
# View build logs
vercel logs <project-name> --follow

# Local build test
npm run build
npm run start
```

### File Upload Issues

Without Vercel Blob, files are temporary. To enable persistence:

1. Setup Vercel Blob storage
2. Add `BLOB_READ_WRITE_TOKEN` to environment variables
3. Redeploy

## Local Development

```bash
# With Docker Compose (MongoDB)
docker compose up

# Or with local PostgreSQL
export DATABASE_ADAPTER=postgres
export DATABASE_URL=postgresql://user:pass@localhost:5432/payload
pnpm dev
```

## Production Checklist

- ✅ Database configured and accessible
- ✅ `PAYLOAD_SECRET` is 32+ characters and secure
- ✅ `PAYLOAD_PUBLIC_SERVER_URL` matches your domain
- ✅ File storage configured (optional but recommended)
- ✅ Environment variables set in Vercel
- ✅ `SEED_DB` set to `false` after first deploy
- ✅ DNS configured (if using custom domain)
- ✅ HTTPS enabled (Vercel handles this automatically)

## Custom Domain

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `PAYLOAD_PUBLIC_SERVER_URL` if needed

## Scaling Considerations

- Vercel's serverless functions have a 30-second execution limit (60s for Pro)
- Large file operations may timeout
- Consider Vercel Pro for production workloads
- Monitor database connection pool usage

## Support

- Payload docs: https://payloadcms.com/docs
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
