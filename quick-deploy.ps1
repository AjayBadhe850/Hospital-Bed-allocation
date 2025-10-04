# Hospital Bed Respiratory System - Quick Deployment Script
Write-Host "🏥 Hospital Bed Respiratory System - Quick Deployment" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

Write-Host "`n📋 Step 1: Create GitHub Repository" -ForegroundColor Yellow
Write-Host "Please follow these steps:" -ForegroundColor White
Write-Host "1. Go to https://github.com" -ForegroundColor Cyan
Write-Host "2. Click the '+' button and select 'New repository'" -ForegroundColor Cyan
Write-Host "3. Repository name: hospital-bed-respiratory" -ForegroundColor Cyan
Write-Host "4. Description: Smart Hospital Management System with Patient-Hospital Assignment Optimization" -ForegroundColor Cyan
Write-Host "5. Make it PUBLIC (required for GitHub Pages)" -ForegroundColor Cyan
Write-Host "6. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Cyan
Write-Host "7. Click 'Create repository'" -ForegroundColor Cyan

Write-Host "`n⏳ Waiting for you to create the repository..." -ForegroundColor Yellow
Read-Host "Press Enter when you've created the repository"

Write-Host "`n📤 Step 2: Get your GitHub username" -ForegroundColor Yellow
$username = Read-Host "Enter your GitHub username"

Write-Host "`n🚀 Step 3: Pushing to GitHub" -ForegroundColor Yellow
Write-Host "Adding remote origin..." -ForegroundColor White
git remote add origin "https://github.com/$username/hospital-bed-respiratory.git"

Write-Host "Renaming branch to main..." -ForegroundColor White
git branch -M main

Write-Host "Pushing to GitHub..." -ForegroundColor White
git push -u origin main

Write-Host "`n✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host "Repository URL: https://github.com/$username/hospital-bed-respiratory" -ForegroundColor Cyan

Write-Host "`n🌐 Step 4: Enable GitHub Pages" -ForegroundColor Yellow
Write-Host "Now follow these steps:" -ForegroundColor White
Write-Host "1. Go to your repository: https://github.com/$username/hospital-bed-respiratory" -ForegroundColor Cyan
Write-Host "2. Click 'Settings' tab" -ForegroundColor Cyan
Write-Host "3. Scroll down to 'Pages' section" -ForegroundColor Cyan
Write-Host "4. Source: Deploy from a branch" -ForegroundColor Cyan
Write-Host "5. Branch: main" -ForegroundColor Cyan
Write-Host "6. Folder: / (root)" -ForegroundColor Cyan
Write-Host "7. Click 'Save'" -ForegroundColor Cyan

Write-Host "`n⏳ Waiting for GitHub Pages setup..." -ForegroundColor Yellow
Read-Host "Press Enter when you've enabled GitHub Pages"

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "Your Hospital Bed Respiratory System is now live at:" -ForegroundColor White
Write-Host "Frontend: https://$username.github.io/hospital-bed-respiratory" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for GitHub Pages to deploy" -ForegroundColor White
Write-Host "2. Visit your live site to test it" -ForegroundColor White
Write-Host "3. For backend deployment, see DEPLOYMENT.md" -ForegroundColor White

Write-Host "`n🎯 Your system is ready!" -ForegroundColor Green
Read-Host "Press Enter to exit"

