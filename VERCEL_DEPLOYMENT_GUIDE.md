# Vercel Deployment Guide - ProprScout

Complete guide for deploying ProprScout frontend to Vercel with all required environment variables.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code must be pushed to GitHub
3. **Backend Deployed**: Your backend must be deployed (Railway/Render/Heroku)
4. **Stripe Account**: For payment functionality ([dashboard.stripe.com](https://dashboard.stripe.com))
5. **Mapbox Account**: For map display ([account.mapbox.com](https://account.mapbox.com))

---

## 🔑 Environment Variables

Add these to Vercel: **Settings → Environment Variables**

### Required Variables

```env
VITE_API_URL=https://your-backend-url.com
VITE_PAYMENT_API_URL=https://your-payment-url.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
VITE_MAPBOX_TOKEN=pk.eyJ...
VITE_FIRECRAWL_API_KEY=fc-226de18402264e69afae0e914ffb728d
```

### How to Get Each Value

#### 1. `VITE_API_URL` & `VITE_PAYMENT_API_URL`
**Where to get**: Your deployed backend URL

**Railway**:
1. Go to [railway.app](https://railway.app)
2. Open your project → Copy the service URL
3. Example: `https://proprscout-api-production-xxxx.up.railway.app`

**Render**:
1. Go to [render.com](https://render.com)
2. Open your service → Copy the URL
3. Example: `https://proprscout-api.onrender.com`

**Note**: Usually both URLs are the same (one backend handles all endpoints)

#### 2. `VITE_STRIPE_PUBLISHABLE_KEY`
**Where to get**: [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys
- Copy the **Publishable key** (starts with `pk_test_...` for test or `pk_live_...` for production)
- **NOT the Secret key** (that goes in backend)

#### 3. `VITE_MAPBOX_TOKEN`
**Where to get**: [Mapbox Account](https://account.mapbox.com) → Access Tokens
- Copy the **Default public token** (starts with `pk.`)

#### 4. `VITE_FIRECRAWL_API_KEY`
**Already in your code**: `fc-226de18402264e69afae0e914ffb728d`
- Or get your own from [firecrawl.dev](https://firecrawl.dev)

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed and pushed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"** or **"Import Project"**
3. **Import your Git repository**:
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel to access your repositories
   - Select the ProprScout repository
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
```

### Step 3: Add Environment Variables

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. **Add each variable**:
   - Click **"Add New"**
   - Enter variable name (e.g., `VITE_API_URL`)
   - Enter variable value (e.g., `https://your-backend-url.com`)
   - Select environments: **Production**, **Preview**, **Development**
   - Click **"Save"**
4. **Repeat for all variables**:
   - `VITE_API_URL`
   - `VITE_PAYMENT_API_URL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_MAPBOX_TOKEN`
   - `VITE_FIRECRAWL_API_KEY`

### Step 4: Update Frontend Code (If Needed)

Update hardcoded URLs to use environment variables:

**Files to update**:
- `src/App.jsx` - Replace `http://localhost:3002` with `import.meta.env.VITE_API_URL`
- `src/components/PropertyDetective.jsx` - Replace `http://localhost:3002` with `import.meta.env.VITE_API_URL`
- `src/components/PaymentPage.jsx` - Replace `http://localhost:3001` with `import.meta.env.VITE_PAYMENT_API_URL`
- `src/components/Pricing.jsx` - Replace `http://localhost:3002` with `import.meta.env.VITE_API_URL`

### Step 5: Deploy Backend (If Not Already Done)

Your backend must be deployed separately:

**Railway** (Recommended):
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your backend repository
4. Railway will give you a URL → Use that for `VITE_API_URL`

**Render**:
1. Go to [render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Render will give you a URL → Use that for `VITE_API_URL`

### Step 6: Configure CORS on Backend

Make sure your backend allows requests from your Vercel domain:

**In `backend/backend/server.js`**:
```javascript
const corsOptions = {
  origin: [
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
};
```

### Step 7: Redeploy

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deployment

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Backend deployed and accessible
- [ ] CORS configured on backend
- [ ] Frontend code updated to use environment variables
- [ ] Redeployed after adding variables
- [ ] Tested all features:
  - [ ] Landing page loads
  - [ ] Property URL analysis works
  - [ ] Property Detective (image upload) works
  - [ ] Payment page loads (if Stripe configured)
  - [ ] Maps display (if Mapbox configured)
  - [ ] Dashboard loads

---

## 🔧 Troubleshooting

### Build Fails
- **Check**: `package.json` has correct build script
- **Check**: All dependencies are listed in `package.json`

### Environment Variables Not Working
- **Check**: Variables start with `VITE_` prefix
- **Check**: Redeployed after adding variables
- **Check**: Clear browser cache
- **Check**: Browser console for errors

### API Calls Fail (CORS/404)
- **Check**: `VITE_API_URL` is correct
- **Check**: Backend CORS allows your Vercel domain
- **Check**: Backend is deployed and running
- **Check**: Test API endpoint directly in browser

### Maps Not Loading
- **Check**: `VITE_MAPBOX_TOKEN` is set correctly
- **Check**: Mapbox account has quota available
- **Check**: Browser console for Mapbox errors

### Stripe Not Working
- **Check**: `VITE_STRIPE_PUBLISHABLE_KEY` is set
- **Check**: Using test key (`pk_test_...`) for testing
- **Check**: Backend payment endpoint is configured

---

## 📝 Configuration Files

### `vercel.json`
Already configured in your project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌐 Custom Domain (Optional)

1. Go to **Settings** → **Domains** in Vercel Dashboard
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test backend API endpoints directly
5. Check CORS configuration on backend


