# Deployment Guide

BizTrack is a Next.js application that can be easily deployed to modern hosting platforms like Vercel or Netlify.

## Environment Variables
Before deploying, ensure you have the following environment variables ready:

| Variable | Description | Required |
|----------|-------------|----------|
| `AIRTABLE_API_KEY` | Your Airtable Personal Access Token | Yes (if using Airtable) |
| `AIRTABLE_BASE_ID` | The ID of your Airtable Base | Yes (if using Airtable) |

## Deploy to Vercel (Recommended)

1. **Push to GitHub**: comprehensive
   Ensure your code is pushed to a GitHub repository.

2. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click "Add New..." -> "Project".
   - Select your GitHub repository.

3. **Configure Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Environment Variables**: Add `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`.

4. **Deploy**:
   Click "Deploy". Vercel will build and start your application.

## Deploy to Netlify

1. **Push to GitHub**:
   Ensure your code is pushed to a GitHub repository.

2. **New Site from Git**:
   - Go to [Netlify Dashboard](https://app.netlify.com/).
   - Click "Add new site" -> "Import from an existing project".
   - Connect to GitHub and select your repository.

3. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

4. **Environment Variables**:
   - Go to "Site settings" -> "Build & deploy" -> "Environment".
   - Add `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`.

5. **Deploy**:
   Click "Deploy site".

## Database Note
By default, this project uses SQLite (`biztrack.db`). Since Vercel and Netlify are serverless and have ephemeral file systems, **SQLite will not persist data across deployments or even function executions in some cases**.

For production deployment:
1. **Switch to a Cloud Database**: Use a service like Turso, PlanetScale, or a hosted PostgreSQL instance (e.g., Supabase, Neon).
2. **Update Database Config**: Modify `lib/db.ts` (or equivalent) to connect to the cloud database instead of the local SQLite file.
