# Deployment Guide for Ano

This guide walks you through deploying Ano to npm and the landing page to Vercel.

---

## 🚀 Quick Overview

**Three Deployments:**
1. **npm Package** (CLI + Web Viewer) - Auto-deployed via GitHub Actions
2. **Landing Page** - Deployed to Vercel
3. **MCP Server** - Distributed with the npm package

---

## 📦 Part 1: Publishing to npm

### Prerequisites

1. **npm Account**
   - Create account at https://www.npmjs.com/signup
   - Verify your email

2. **npm Access Token**
   ```bash
   # Login to npm
   npm login

   # Generate token
   npm token create --access=public --description="GitHub Actions - Ano"
   ```
   - Copy the token (you won't see it again!)

3. **Add Token to GitHub**
   - Go to: https://github.com/vedpawar2254/Ano/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste the token
   - Click "Add secret"

### Test Locally First

```bash
# 1. Build everything
npm run build:all

# 2. Test the package
npm pack --dry-run

# 3. Create actual package
npm pack

# 4. Test installation locally
npm install -g nakedved-ano-0.1.0.tgz

# 5. Verify it works
ano --version
ano --help

# 6. Test the serve command
echo "# Test" > test.md
ano serve test.md
# Visit http://localhost:3000

# 7. Clean up
npm uninstall -g @nakedved/ano
rm nakedved-ano-0.1.0.tgz
```

### Publish Manually (First Time)

```bash
# Make sure you're logged in
npm whoami

# Publish (scoped packages are private by default, so use --access public)
npm publish --access public
```

### Auto-Publish via GitHub Actions

**Current Setup:**
- ✅ CI workflow builds and tests on every push/PR
- ✅ Release workflow publishes to npm on push to `main`
- ✅ `NPM_TOKEN` needed in GitHub secrets

**To Enable:**
1. Add `NPM_TOKEN` to GitHub secrets (see above)
2. Push to `main` branch
3. Watch the "CI" workflow in Actions tab
4. Package will be published automatically!

**Workflow Triggers:**
- Runs on: Push to `main` (not PRs)
- Needs: `build` job to pass
- Publishes: `@nakedved/ano@0.1.0`

---

## 🌐 Part 2: Deploying Landing Page to Vercel

### Option A: Vercel CLI (Recommended for First Time)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate to landing directory
cd landing

# 4. Deploy to preview
vercel

# 5. Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select `vedpawar2254/Ano`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: **landing**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait ~1-2 minutes
   - Get your URL: `https://ano-xxxxx.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS setup instructions

### Option C: Auto-Deploy via GitHub (After Initial Setup)

Once Vercel project is created:
1. Every push to `main` auto-deploys to production
2. Every PR creates a preview deployment
3. No manual steps needed!

---

## 🔄 Part 3: Versioning and Releases

### Bumping Version

```bash
# For bug fixes (0.1.0 → 0.1.1)
npm version patch

# For new features (0.1.0 → 0.2.0)
npm version minor

# For breaking changes (0.1.0 → 1.0.0)
npm version major

# This will:
# 1. Update version in package.json
# 2. Create a git commit
# 3. Create a git tag
```

### Creating GitHub Release

```bash
# 1. Bump version
npm version minor -m "Release v%s"

# 2. Push with tags
git push origin main --tags

# 3. Create release on GitHub
# Go to: https://github.com/vedpawar2254/Ano/releases/new
# - Tag: v0.2.0
# - Title: v0.2.0
# - Description: Copy from CHANGELOG.md
# - Attach: vedpawar-ano-0.2.0.tgz (from npm pack)
```

### Auto-Release (Future Enhancement)

Consider adding **semantic-release**:
```bash
npm install --save-dev semantic-release @semantic-release/changelog @semantic-release/git
```

---

## 📝 Checklist Before Going Live

### Pre-Flight Checks

- [ ] **Code Quality**
  - [ ] All tests pass locally
  - [ ] TypeScript compiles without errors
  - [ ] No console.errors in production code
  - [ ] Web UI loads without errors

- [ ] **Package Configuration**
  - [x] Updated package.json with repository info
  - [x] Created .npmignore
  - [x] Created CHANGELOG.md
  - [x] Updated README install instructions
  - [ ] Verified package size < 1MB

- [ ] **npm Setup**
  - [ ] Created npm account
  - [ ] Generated NPM_TOKEN
  - [ ] Added NPM_TOKEN to GitHub secrets
  - [ ] Tested `npm pack --dry-run`
  - [ ] Tested local installation

- [ ] **Landing Page**
  - [x] Created vercel.json
  - [ ] Optimized images (logo.png is 5.2MB!)
  - [ ] Tested production build locally
  - [ ] Set up Vercel project

- [ ] **Documentation**
  - [x] README has correct install command
  - [x] CHANGELOG updated
  - [ ] Links point to correct GitHub repo
  - [ ] Examples work

---

## 🚨 Common Issues

### "Package name already taken"

**Problem:** `ano` is already published
**Solution:** ✅ Already using `@nakedved/ano` (scoped package)

### "You must sign in to publish"

**Problem:** Not logged in to npm
**Solution:**
```bash
npm login
npm whoami  # Verify
```

### "Access denied to publish"

**Problem:** No permission for scoped package
**Solution:** Use `--access public`:
```bash
npm publish --access public
```

### "CI failing on npm publish"

**Problem:** NPM_TOKEN not set
**Solution:**
1. Generate token: `npm token create`
2. Add to GitHub: Settings → Secrets → Actions → `NPM_TOKEN`

### "Vercel build failing"

**Problem:** Build command or directory wrong
**Solution:** Check `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

## 📊 Post-Deployment Monitoring

### npm Package

- **Stats**: https://www.npmjs.com/package/@nakedved/ano
- **Downloads**: Check daily/weekly/monthly on npm
- **Unpkg CDN**: https://unpkg.com/@nakedved/ano@latest/

### Landing Page

- **URL**: Check Vercel dashboard
- **Analytics**: Enable in Vercel settings
- **Logs**: Check deployment logs in Vercel

### GitHub

- **Actions**: https://github.com/vedpawar2254/Ano/actions
- **Releases**: https://github.com/vedpawar2254/Ano/releases
- **Issues**: Monitor for bug reports

---

## 🔐 Security Notes

1. **Never commit NPM_TOKEN** - Use GitHub secrets
2. **Rotate tokens periodically** - Every 3-6 months
3. **Use 2FA on npm** - Enable at npmjs.com
4. **Review dependencies** - Run `npm audit` regularly

---

## 🎯 Next Steps After Deployment

1. **Announce Release**
   - Post on Twitter/LinkedIn
   - Share in Claude Code community
   - Create demo video

2. **Monitor**
   - Watch for issues
   - Check download stats
   - Review user feedback

3. **Iterate**
   - Fix bugs quickly
   - Add requested features
   - Keep CHANGELOG updated

4. **Marketing**
   - Create tutorial blog posts
   - Make demo videos
   - Engage with users

---

## 📞 Support

**Issues:** https://github.com/vedpawar2254/Ano/issues
**Email:** ved.pawar2024@rishihood.edu.in

---

## Quick Command Reference

```bash
# npm
npm publish --access public          # Publish to npm
npm version patch                     # Bump version
npm pack --dry-run                    # Test package

# Vercel
vercel                                # Deploy preview
vercel --prod                         # Deploy production
vercel domains add example.com        # Add domain

# Git
git push origin main --tags           # Push with tags
git tag v0.1.0                        # Create tag

# Development
npm run build:all                     # Build everything
npm run test                          # Run tests (when added)
npm link                              # Link for development
```

---

**You're ready to deploy! 🚀**
