# 🚀 Deployment Guide - Hospital Bed Respiratory System

This guide will help you deploy the Smart Hospital Management System to GitHub with both frontend and backend hosting.

## 📋 Prerequisites

- GitHub account
- Node.js installed locally
- Git installed locally

## 🎯 Deployment Overview

- **Frontend**: GitHub Pages (Static hosting)
- **Backend**: Render/Railway/Vercel (API hosting)
- **Repository**: `hospital-bed-respiratory`

## 📁 Step 1: Prepare Repository

### 1.1 Initialize Git Repository
```bash
cd "C:\New folder (2)"
git init
git add .
git commit -m "Initial commit: Hospital Bed Respiratory System"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name: `hospital-bed-respiratory`
4. Description: `Smart Hospital Management System with Patient-Hospital Assignment Optimization`
5. Make it **Public** (required for GitHub Pages)
6. Don't initialize with README (we already have files)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/hospital-bed-respiratory.git
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy Backend API

### Option A: Render (Recommended - Free Tier)

1. **Sign up at [Render](https://render.com)**
2. **Connect GitHub account**
3. **Create New Web Service**:
   - Connect repository: `hospital-bed-respiratory`
   - Name: `hospital-bed-respiratory-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

5. **Deploy**: Click "Create Web Service"

6. **Get Backend URL**: `https://hospital-bed-respiratory-api.onrender.com`

### Option B: Railway

1. **Sign up at [Railway](https://railway.app)**
2. **Connect GitHub account**
3. **Deploy from GitHub**:
   - Select repository: `hospital-bed-respiratory`
   - Railway will auto-detect Node.js
   - Deploy automatically

4. **Get Backend URL**: `https://hospital-bed-respiratory-system.railway.app`

### Option C: Vercel

1. **Sign up at [Vercel](https://vercel.com)**
2. **Import Project**:
   - Connect GitHub repository
   - Framework: `Other`
   - Build Command: `npm install`
   - Output Directory: `.`

3. **Deploy**: Click "Deploy"

4. **Get Backend URL**: `https://hospital-bed-respiratory-system.vercel.app`

## 🎨 Step 3: Deploy Frontend (GitHub Pages)

### 3.1 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Source: **Deploy from a branch**
5. Branch: **main**
6. Folder: **/ (root)**
7. Click **Save**

### 3.2 Update Frontend Configuration
After getting your backend URL, update `config.js`:

```javascript
production: {
    apiUrl: 'https://YOUR_BACKEND_URL/api', // Replace with your actual backend URL
    environment: 'production'
}
```

### 3.3 Update CORS in Backend
Update `server.js` with your GitHub Pages URL:

```javascript
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? ['https://YOUR_USERNAME.github.io', 'https://YOUR_BACKEND_URL']
        : true,
    credentials: true
};
```

### 3.4 Commit and Push Changes
```bash
git add .
git commit -m "Update configuration for production deployment"
git push origin main
```

## 🔗 Step 4: Final Configuration

### 4.1 Update Repository URLs
1. **Frontend URL**: `https://YOUR_USERNAME.github.io/hospital-bed-respiratory`
2. **Backend URL**: Your deployed backend URL
3. **API Health Check**: `https://YOUR_BACKEND_URL/api/health`

### 4.2 Test Deployment
1. Visit your GitHub Pages URL
2. Check browser console for API connection
3. Test patient creation and search
4. Verify hospital assignment algorithms

## 📊 Step 5: Repository Setup

### 5.1 Update README.md
Add deployment badges and live demo links:

```markdown
# 🏥 Hospital Bed Respiratory System

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://YOUR_USERNAME.github.io/hospital-bed-respiratory)
[![API Status](https://img.shields.io/badge/API-Live-blue)](https://YOUR_BACKEND_URL/api/health)

## 🚀 Live Demo
- **Frontend**: [https://YOUR_USERNAME.github.io/hospital-bed-respiratory](https://YOUR_USERNAME.github.io/hospital-bed-respiratory)
- **API**: [https://YOUR_BACKEND_URL/api/health](https://YOUR_BACKEND_URL/api/health)
```

### 5.2 Add Topics/Tags
In GitHub repository settings, add topics:
- `hospital-management`
- `healthcare`
- `optimization-algorithms`
- `nodejs`
- `javascript`
- `graph-matching`
- `knapsack-algorithm`
- `branch-and-bound`

## 🎯 Step 6: Verification Checklist

- [ ] Repository is public
- [ ] GitHub Pages is enabled and working
- [ ] Backend API is deployed and responding
- [ ] Frontend connects to backend successfully
- [ ] Patient creation works
- [ ] Search functionality works
- [ ] Hospital assignment algorithms work
- [ ] All pages load correctly
- [ ] Mobile responsive design works

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Update CORS configuration in `server.js`
2. **API Not Responding**: Check backend deployment logs
3. **GitHub Pages Not Loading**: Ensure repository is public
4. **Frontend Not Connecting**: Verify API URL in `config.js`

### Debug Commands:
```bash
# Test backend locally
curl https://YOUR_BACKEND_URL/api/health

# Test frontend locally
npm start
# Visit http://localhost:3000
```

## 🎉 Success!

Once deployed, your repository will show:
- ✅ **"Visit Site"** button for live demo
- ✅ **Live API** for backend functionality
- ✅ **Professional README** with badges
- ✅ **Working demo** with all features

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check browser console for errors

---

**Repository Name**: `hospital-bed-respiratory`  
**Live Demo**: `https://YOUR_USERNAME.github.io/hospital-bed-respiratory`  
**API**: `https://YOUR_BACKEND_URL/api/health`
