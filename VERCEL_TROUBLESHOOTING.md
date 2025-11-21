# Vercel 404 Error Troubleshooting

## Common Causes of 404 Errors on Vercel

### 1. Build Configuration Issues

**Check in Vercel Dashboard:**
- Go to **Settings → Build & Development Settings**
- Verify:
  - **Framework Preset**: Vite
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`
  - **Root Directory**: `./` (leave empty for root)

### 2. Missing index.html

**Verify:**
```bash
# Check if index.html exists in dist folder
ls -la dist/index.html
```

**Fix:**
- Ensure `vite.config.js` has `outDir: 'dist'`
- Run `npm run build` locally to verify build works
- Check that `dist/index.html` is generated

### 3. Routing Issues (SPA)

**Current vercel.json configuration:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This should handle all routes. If 404 persists, try:

**Alternative vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Build Failures

**Check Vercel Build Logs:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the build logs for errors

**Common build errors:**
- Missing environment variables
- Dependency installation failures
- TypeScript/ESLint errors
- Missing files

### 5. Environment Variables

**Required for build:**
- `VITE_API_URL` (can be placeholder for build)
- `VITE_PAYMENT_API_URL` (can be placeholder for build)
- `VITE_STRIPE_PUBLISHABLE_KEY` (can be placeholder for build)
- `VITE_MAPBOX_TOKEN` (can be placeholder for build)

**Note:** Vite requires `VITE_` prefix. Variables without this prefix won't be available in the build.

### 6. Framework Detection

**If Vercel doesn't detect Vite:**
1. Ensure `vite.config.js` exists in root
2. Ensure `package.json` has `vite` as dependency
3. Manually set Framework Preset to "Vite" in Vercel settings

### 7. File Structure

**Verify structure:**
```
ProprScout-main/
├── vercel.json          ✅ Must exist
├── vite.config.js       ✅ Must exist
├── package.json         ✅ Must exist
├── index.html           ✅ Must exist (in root or src)
├── src/                 ✅ Source files
└── dist/                ✅ Build output (generated)
```

## Quick Fixes

### Fix 1: Update vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

### Fix 2: Add .vercelignore (if needed)
Create `.vercelignore`:
```
node_modules
.env.local
.env.*.local
```

### Fix 3: Verify Build Locally
```bash
npm run build
ls -la dist/
# Should see index.html and assets folder
```

### Fix 4: Redeploy
1. Go to Vercel Dashboard
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger rebuild

## Debugging Steps

1. **Check Build Logs**
   - Vercel Dashboard → Deployments → Latest → Build Logs

2. **Test Build Locally**
   ```bash
   npm run build
   npm run preview
   # Should work on localhost
   ```

3. **Check Vercel Settings**
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist

4. **Verify Files**
   - dist/index.html exists
   - dist/assets/ folder exists
   - vercel.json is correct

5. **Check Environment Variables**
   - All required VITE_* variables are set
   - Variables are set for Production environment

## Still Getting 404?

1. **Clear Vercel Cache**
   - Settings → General → Clear Build Cache
   - Redeploy

2. **Check Custom Domain**
   - If using custom domain, verify DNS settings
   - Check SSL certificate status

3. **Contact Vercel Support**
   - Include deployment URL
   - Include build logs
   - Include vercel.json content

