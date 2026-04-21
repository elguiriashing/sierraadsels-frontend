# Deployment Guide - Sierraadsels Live Website

## Architecture
- **Frontend**: Cloudflare Pages (Next.js)
- **Backend**: Railway (Node.js/Express)
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudflare R2 (S3-compatible)

## Step 1: Set up Cloudflare R2 (Image Storage)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Create a bucket named `sierraadsels-images`
3. Create R2 API Token:
   - Go to "Manage R2 API Tokens"
   - Create token with "Object Read & Write" permissions
   - Save the Access Key ID and Secret Access Key
4. Set up public access:
   - Go to bucket settings
   - Enable "Public URLs"
   - Note the public URL (e.g., `https://pub-<hash>.r2.dev`)

## Step 2: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (M0 free tier is fine)
3. Create a database user with read/write permissions
4. Get the connection string (replace `<password>` with your user's password)
5. Allow access from anywhere (0.0.0.0/0) or just Railway's IPs

## Step 3: Deploy Backend to Railway

1. Push the `backend` folder to a new GitHub repo:
```bash
cd backend
git init
git add .
git commit -m "Initial backend"
git remote add origin https://github.com/YOURNAME/sierraadsels-backend.git
git push -u origin main
```

2. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub repo
3. Select your backend repo
4. Add Environment Variables in Railway dashboard:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sierraadsels
JWT_SECRET=your-random-secret-key-here
ADMIN_PASSWORD_HASH=$2a$10$... (see below for generation)
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=sierraadsels-images
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
FRONTEND_URL=https://sierraadsels.com (your domain)
```

5. Generate admin password hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

6. Deploy! Railway will give you a URL like `https://sierraadsels-backend.up.railway.app`

## Step 4: Deploy Frontend to Cloudflare Pages

1. Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: 'https://your-railway-backend.up.railway.app/api',
  },
}
module.exports = nextConfig
```

2. Push frontend to GitHub (or use the same repo with frontend folder)

3. Go to [Cloudflare Pages](https://dash.cloudflare.com) → Pages → Create a project
4. Connect to your GitHub repo
5. Build settings:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
6. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL + `/api`
7. Deploy!

## Step 5: Connect Custom Domain

1. In Cloudflare Pages dashboard, go to "Custom domains"
2. Add your domain (e.g., `sierraadsels.com`)
3. Follow DNS setup instructions (add CNAME record)
4. Update `FRONTEND_URL` in Railway to match your domain
5. Wait for SSL certificate to provision

## Step 6: Upload Initial Images

1. Log in to your live site using the admin password
2. Go to each category
3. Upload images through the edit interface
4. Images are stored in R2 and served via CDN

## Costs Estimate

- **Cloudflare Pages**: Free (up to 500 builds/month, unlimited requests)
- **Cloudflare R2**: ~$0.015/GB/month storage, $0.00 egress (first 10GB free)
- **Railway**: Free tier (5GB disk, limited hours) or ~$5/month for hobby plan
- **MongoDB Atlas**: Free M0 tier (512MB storage)
- **Domain**: ~$10-15/year

**Total: ~$5-10/month for hobby plan, less if you stay within free tiers**

## Important Notes

1. **Image uploads**: All images go to R2, not your Git repo. No more 50MB limit!
2. **Data persistence**: All data is in MongoDB, shared across all devices
3. **Tilly can edit from anywhere**: Just log in with the admin password
4. **Backups**: MongoDB Atlas has automatic backups on paid tiers
