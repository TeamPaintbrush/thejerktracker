# Environment Variables Required for Vercel

Add these environment variables in your Vercel dashboard:

1. **NEXTAUTH_SECRET**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Name: `NEXTAUTH_SECRET`
   - Value: Generate a random secret (32+ characters)
   - You can generate one with: `openssl rand -base64 32`

2. **DATABASE_URL** (Already set via Vercel Postgres)
   - This should already be set from your Vercel Postgres setup
   - Verify it's still there in Environment Variables

3. **NEXTAUTH_URL** (Optional - now defaults to your Vercel URL)
   - Name: `NEXTAUTH_URL`
   - Value: `https://thejerktracker0.vercel.app`

## Steps to Fix:

1. Go to https://vercel.com/dashboard
2. Select your `thejerktracker0` project
3. Go to Settings > Environment Variables
4. Add the missing variables above
5. Redeploy the project

## To Generate NEXTAUTH_SECRET:

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use:
```bash
openssl rand -base64 32
```

The 500 error is likely because NEXTAUTH_SECRET is missing or the database connection is failing.