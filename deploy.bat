@echo off
echo 🏥 Hospital Bed Respiratory System - Deployment Script
echo =====================================================

echo.
echo 📋 Step 1: Creating GitHub Repository
echo Please create a new repository named "hospital-bed-respiratory" on GitHub
echo Make sure it's PUBLIC (required for GitHub Pages)
echo.
pause

echo.
echo 📤 Step 2: Pushing to GitHub
echo Please run these commands in your terminal:
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/hospital-bed-respiratory.git
echo git branch -M main
echo git push -u origin main
echo.
pause

echo.
echo 🌐 Step 3: Deploy Backend
echo Choose one of these options:
echo.
echo Option A - Render (Recommended):
echo 1. Go to https://render.com
echo 2. Sign up and connect GitHub
echo 3. Create New Web Service
echo 4. Connect repository: hospital-bed-respiratory
echo 5. Environment: Node
echo 6. Build Command: npm install
echo 7. Start Command: npm start
echo 8. Plan: Free
echo.
echo Option B - Railway:
echo 1. Go to https://railway.app
echo 2. Sign up and connect GitHub
echo 3. Deploy from GitHub
echo 4. Select repository: hospital-bed-respiratory
echo.
echo Option C - Vercel:
echo 1. Go to https://vercel.com
echo 2. Import Project
echo 3. Connect GitHub repository
echo 4. Deploy
echo.
pause

echo.
echo 🎨 Step 4: Enable GitHub Pages
echo 1. Go to your repository on GitHub
echo 2. Click Settings tab
echo 3. Scroll to Pages section
echo 4. Source: Deploy from a branch
echo 5. Branch: main
echo 6. Folder: / (root)
echo 7. Click Save
echo.
pause

echo.
echo 🔧 Step 5: Update Configuration
echo After getting your backend URL, update config.js with your backend URL
echo Then commit and push the changes:
echo.
echo git add .
echo git commit -m "Update configuration for production"
echo git push origin main
echo.
pause

echo.
echo ✅ Deployment Complete!
echo Your system will be available at:
echo Frontend: https://YOUR_USERNAME.github.io/hospital-bed-respiratory
echo Backend: https://YOUR_BACKEND_URL/api/health
echo.
echo 📖 For detailed instructions, see DEPLOYMENT.md
echo.
pause
