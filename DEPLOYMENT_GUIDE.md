# 1099 Ledger - PostgreSQL Deployment Guide

Your app is **production-ready** and can be deployed to any platform that supports PostgreSQL!

## 🚀 Recommended Platforms

### Option 1: Railway (EASIEST - Recommended)
- ✅ Free tier with $5 credit/month
- ✅ Automatic PostgreSQL provisioning
- ✅ Easy environment variable management
- ✅ GitHub integration
- ✅ Auto-deploys on push

### Option 2: Render
- ✅ Free tier available
- ✅ Managed PostgreSQL
- ✅ Simple configuration
- ✅ Good for production

### Option 3: Heroku
- ✅ Most reliable
- ✅ Excellent PostgreSQL support
- ⚠️ Paid only (starts $7/month)

---

## 📋 Pre-Deployment Checklist

### ✅ What's Already Done:
- [x] PostgreSQL database setup
- [x] Backend API fully functional
- [x] Frontend Expo app working
- [x] Environment variables configured
- [x] No hardcoded secrets
- [x] CORS properly configured
- [x] Authentication working
- [x] Subscription system implemented

### 📝 What You Need:
1. GitHub account
2. Railway/Render/Heroku account
3. Your app code in a Git repository

---

## 🚂 RAILWAY DEPLOYMENT (Recommended)

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - 1099 Ledger"

# Create GitHub repository and push
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Railway

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **New Project**: Click "New Project"
3. **Deploy from GitHub**: Select your repository
4. **Add PostgreSQL**: Click "+ New" → "Database" → "PostgreSQL"
5. **Configure Services**:

#### Backend Service:
```yaml
Name: backend
Build Command: pip install -r backend/requirements.txt
Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
Root Directory: /
```

**Environment Variables** (Auto-detect from Railway PostgreSQL):
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET_KEY=your-secret-key-change-this
PORT=8001
```

#### Frontend Service:
```yaml
Name: frontend
Build Command: cd frontend && yarn install && npx expo export -p web
Start Command: npx serve frontend/dist -s -p $PORT
Root Directory: /
```

**Environment Variables**:
```env
EXPO_PUBLIC_BACKEND_URL=${{backend.url}}
```

### Step 3: Access Your App

- Backend: `https://your-app-backend.railway.app`
- Frontend: `https://your-app-frontend.railway.app`

---

## 🎨 RENDER DEPLOYMENT

### Step 1: Create Render Account
Go to [render.com](https://render.com) and sign up

### Step 2: Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `ledger-db`
3. Plan: Free
4. Create Database
5. **Save the connection string**

### Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:

```yaml
Name: ledger-backend
Environment: Python 3
Build Command: pip install -r backend/requirements.txt
Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```

**Environment Variables**:
```env
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET_KEY=your-secret-key-change-this
PYTHON_VERSION=3.11
```

### Step 4: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect repository
3. Configure:

```yaml
Name: ledger-frontend
Build Command: cd frontend && yarn install && npx expo export -p web
Publish Directory: frontend/dist
```

**Environment Variables**:
```env
EXPO_PUBLIC_BACKEND_URL=https://ledger-backend.onrender.com
```

---

## 🟣 HEROKU DEPLOYMENT

### Step 1: Install Heroku CLI

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

### Step 2: Create Apps

```bash
# Create backend app
heroku create ledger-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0 -a ledger-backend

# Create frontend app
heroku create ledger-frontend
```

### Step 3: Configure Backend

Create `backend/Procfile`:
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

Create `backend/runtime.txt`:
```
python-3.11.7
```

Set environment variables:
```bash
heroku config:set JWT_SECRET_KEY=your-secret-key -a ledger-backend
```

### Step 4: Deploy

```bash
# Deploy backend
git subtree push --prefix backend heroku main

# Deploy frontend (Expo web build)
cd frontend
npx expo export -p web
# Deploy dist folder to frontend app
```

---

## 🔐 Security Configuration

### Environment Variables to Set:

**Backend (.env or platform config):**
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET_KEY=generate-a-strong-random-key
PORT=8001
```

**Frontend (.env or platform config):**
```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Generate Secure JWT Secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📱 Expo Mobile App Configuration

After deploying backend, update your Expo app:

1. **Update API URL** in `frontend/.env`:
```env
EXPO_PUBLIC_BACKEND_URL=https://your-deployed-backend-url.com
```

2. **Build for Production**:
```bash
cd frontend
eas build --platform ios
eas build --platform android
```

3. **Submit to Stores**:
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 🧪 Testing Deployed App

### Test Backend:
```bash
curl https://your-backend-url.com/api/health
# Should return: {"status":"healthy","database":"postgresql"}

curl https://your-backend-url.com/api/subscription/plans
# Should return: {"plans":[...]}
```

### Test Frontend:
1. Open frontend URL in browser
2. Try Google sign-in
3. Test navigation
4. Create a test trip
5. Check subscription screen

---

## 🔧 Troubleshooting

### Backend Issues:

**Database Connection Errors:**
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database

# Verify PostgreSQL is running
# Check logs on your platform dashboard
```

**Module Not Found:**
```bash
# Ensure requirements.txt is up to date
pip freeze > backend/requirements.txt
git commit and redeploy
```

### Frontend Issues:

**API Connection Failed:**
- Verify EXPO_PUBLIC_BACKEND_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && yarn install`
- Clear metro cache: `npx expo start -c`

---

## 📊 Database Migration

Your PostgreSQL database will be automatically created with these tables:
- `users` - User accounts
- `user_sessions` - Authentication sessions
- `vehicles` - User vehicles
- `trips` - Mileage tracking
- `expenses` - Expense records
- `subscriptions` - User subscription plans

Tables are created automatically on first run via FastAPI startup.

---

## 🎯 Post-Deployment

### Monitor Your App:
- Check platform logs for errors
- Monitor database usage
- Set up alerts for downtime
- Track API response times

### Scaling:
- Railway: Upgrade plan for more resources
- Render: Switch to paid tier for better performance
- Heroku: Add more dynos for scaling

---

## 📞 Need Help?

### Platform Support:
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)

### Common Issues:
1. **Port binding**: Ensure backend uses `$PORT` environment variable
2. **Database URL**: Must be provided by platform or manually configured
3. **Build fails**: Check Python/Node versions match requirements

---

## ✅ Your App is Ready!

Your 1099 Ledger app is production-ready with:
- ✅ Real subscription system (Basic/Mid/Premium)
- ✅ PostgreSQL database
- ✅ Google OAuth authentication
- ✅ Mileage tracking (GPS + manual)
- ✅ Expense tracking with receipts
- ✅ IRS-compliant tax reports
- ✅ Usage tracking and limits
- ✅ Professional UI/UX

**Choose your platform and deploy! 🚀**
