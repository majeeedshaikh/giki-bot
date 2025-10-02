# Vercel Deployment Guide

## Quick Deployment to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the project**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name: `giki-admissions-chatbot` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings? `N`

5. **Your chatbot will be deployed** and you'll get a URL like: `https://giki-admissions-chatbot.vercel.app`

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/giki-admissions-chatbot.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "New Project"**

4. **Import your GitHub repository**

5. **Configure the project**:
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: Leave empty
   - Output Directory: Leave empty

6. **Add Environment Variable**:
   - Name: `GROQ_API_KEY`
   - Value: `[Your Groq API Key]` (Get it from https://console.groq.com/keys)

7. **Click "Deploy"**

## Environment Variables

The following environment variable is automatically configured in `vercel.json`:
- `GROQ_API_KEY`: Your Groq API key

## Project Structure

```
giki-bot/
├── api/
│   ├── chat.js          # Chat API endpoint
│   └── health.js        # Health check endpoint
├── index.html           # Frontend interface
├── pdf-content.txt      # Extracted PDF content
├── vercel.json          # Vercel configuration
├── package.json         # Node.js dependencies
└── DEPLOYMENT.md        # This file
```

## Testing Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally**:
   ```bash
   vercel dev
   ```

3. **Open**: `http://localhost:3000`

## Features

- ✅ Serverless deployment (no server needed)
- ✅ Free hosting on Vercel
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Environment variables secured
- ✅ PDF content pre-extracted for fast loading
- ✅ Responsive design
- ✅ Real-time chat interface

## Custom Domain (Optional)

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Configure DNS as instructed

## Monitoring

- View deployment logs in Vercel dashboard
- Monitor API usage in the "Functions" tab
- Check performance metrics in "Analytics"

Your chatbot will be live and accessible to your client via the Vercel URL! 🚀
