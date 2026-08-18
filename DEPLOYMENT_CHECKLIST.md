# 🚀 Deployment Checklist

Use this checklist to ensure your system is properly deployed and ready for production use.

---

## ✅ Pre-Deployment Checklist

### 1. Database Setup

- [ ] **Open Supabase Dashboard**
- [ ] **Navigate to SQL Editor**
- [ ] **Copy content from:** `backend/database/PRODUCTION_READY_SCHEMA.sql`
- [ ] **Paste and execute** the entire script
- [ ] **Verify success:** Run verification queries at end of script
- [ ] **Confirm 5 roles exist**
- [ ] **Confirm 15 employees exist**
- [ ] **Confirm RLS is enabled** on all tables
- [ ] **Test your admin code:** Run `select * from verify_employee_code('EMP-10001');`

### 2. Backend Configuration

- [ ] **Copy `.env.example` to `.env`** (if exists)
- [ ] **Set environment variables:**
  ```env
  PORT=5000
  SUPABASE_URL=your_supabase_project_url
  SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
  NODE_ENV=production
  ```
- [ ] **Install dependencies:** `cd backend && npm install`
- [ ] **Test backend locally:** `npm run dev`
- [ ] **Verify server starts** on http://localhost:5000
- [ ] **Test API endpoint:** http://localhost:5000/api/roles

### 3. Frontend Configuration

- [ ] **Copy `.env.example` to `.env`** (if exists)
- [ ] **Set environment variables:**
  ```env
  VITE_API_URL=http://localhost:5000
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```
- [ ] **Install dependencies:** `cd frontend && npm install`
- [ ] **Test frontend locally:** `npm run dev`
- [ ] **Verify frontend loads** on http://localhost:5173
- [ ] **Check for console errors**

### 4. Integration Testing

- [ ] **Both servers running** (backend + frontend)
- [ ] **Test landing page loads**
- [ ] **Test sign up flow:**
  - [ ] Click "Sign Up" button
  - [ ] Enter employee code: `EMP-10001`
  - [ ] Click "Verify" button
  - [ ] See your info populate
  - [ ] Enter password (min 8 chars)
  - [ ] Submit form
  - [ ] Verify account created
- [ ] **Test login flow:**
  - [ ] Enter email: `daisyreydaguplo18@gmail.com`
  - [ ] Enter password
  - [ ] Click "Sign In"
  - [ ] Verify redirect to dashboard
- [ ] **Test admin dashboard:**
  - [ ] Navigate to Employee Management
  - [ ] Verify users list loads
  - [ ] Create a test user
  - [ ] Assign a role
  - [ ] Navigate to Role Management
  - [ ] Verify roles display
  - [ ] Navigate to System Settings
  - [ ] Verify settings tabs work
  - [ ] Navigate to Audit Logs
  - [ ] Verify logs display
- [ ] **Test logout** - Click logout and verify redirect

---

## 🌐 Production Deployment

### Database (Supabase) - Already Done ✅

- [x] Supabase project created
- [x] Database schema deployed
- [x] RLS policies active
- [ ] **Configure backups:**
  - [ ] Enable automated daily backups
  - [ ] Set backup retention period
- [ ] **Set up monitoring:**
  - [ ] Enable database metrics
  - [ ] Configure alert notifications
- [ ] **Optimize performance:**
  - [ ] Review query performance
  - [ ] Add additional indexes if needed

### Backend Deployment

Choose one hosting platform:

#### Option A: Railway.app
- [ ] Create Railway account
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set start command: `npm start`
- [ ] Deploy and verify

#### Option B: Render.com
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set environment: Node
- [ ] Configure environment variables
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Deploy and verify

#### Option C: Heroku
- [ ] Install Heroku CLI
- [ ] Login: `heroku login`
- [ ] Create app: `heroku create your-app-name`
- [ ] Set environment variables: `heroku config:set KEY=value`
- [ ] Push code: `git push heroku main`
- [ ] Verify deployment

**After Backend Deployment:**
- [ ] Note production URL (e.g., `https://your-app.railway.app`)
- [ ] Test API endpoints: `GET https://your-app.railway.app/api/roles`
- [ ] Configure CORS if needed
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate

### Frontend Deployment

Choose one hosting platform:

#### Option A: Vercel (Recommended for React)
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Framework: Vite
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Set environment variables:
  - `VITE_API_URL` = your backend production URL
  - `VITE_SUPABASE_URL` = your Supabase URL
  - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
- [ ] Deploy and verify

#### Option B: Netlify
- [ ] Create Netlify account
- [ ] Create new site from Git
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
- [ ] Set environment variables (same as above)
- [ ] Deploy and verify

**After Frontend Deployment:**
- [ ] Note production URL (e.g., `https://your-app.vercel.app`)
- [ ] Test all pages load correctly
- [ ] Test authentication flow
- [ ] Test admin features
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (auto on Vercel/Netlify)

### CORS Configuration

After both deployments:
- [ ] Update backend CORS settings to allow your frontend domain
- [ ] Test cross-origin requests work correctly

---

## 🧪 Production Testing

### Smoke Tests

- [ ] **Public pages accessible**
  - [ ] Landing page loads
  - [ ] Auth modal opens
  - [ ] Footer links work
- [ ] **Authentication works**
  - [ ] Sign up with employee code
  - [ ] Email verification (if enabled)
  - [ ] Login with credentials
  - [ ] Logout functionality
- [ ] **Admin dashboard accessible**
  - [ ] Dashboard loads for admin
  - [ ] All navigation links work
  - [ ] Data loads correctly
- [ ] **Admin features work**
  - [ ] Create new user
  - [ ] Assign roles
  - [ ] View audit logs
  - [ ] Update settings
- [ ] **Role-based access works**
  - [ ] Admin sees all features
  - [ ] Manager has limited access
  - [ ] Non-admin blocked from admin pages

### Performance Tests

- [ ] **Page load times acceptable** (< 3 seconds)
- [ ] **API response times fast** (< 500ms)
- [ ] **No console errors**
- [ ] **No memory leaks**
- [ ] **Mobile responsive**

### Security Tests

- [ ] **SQL injection protected** (parameterized queries)
- [ ] **XSS protected** (React escapes by default)
- [ ] **CSRF tokens** (if needed)
- [ ] **Rate limiting** (if implemented)
- [ ] **HTTPS enforced**
- [ ] **Secure headers set**
- [ ] **Passwords hashed** (Supabase Auth)
- [ ] **RLS policies enforced**
- [ ] **API authentication required**

---

## 📋 Post-Deployment

### Documentation

- [ ] **Update README with production URLs**
- [ ] **Document deployment process**
- [ ] **Document environment variables**
- [ ] **Create user guide**
- [ ] **Create admin guide**

### Monitoring

- [ ] **Set up error tracking** (Sentry, LogRocket, etc.)
- [ ] **Configure uptime monitoring** (UptimeRobot, Pingdom)
- [ ] **Set up analytics** (Google Analytics, Plausible)
- [ ] **Configure log aggregation** (if needed)
- [ ] **Set up alerts** for critical errors

### Maintenance

- [ ] **Schedule regular backups**
- [ ] **Plan update schedule**
- [ ] **Document rollback procedure**
- [ ] **Create incident response plan**

### Training

- [ ] **Train admin users**
- [ ] **Train managers**
- [ ] **Train operational staff**
- [ ] **Provide employee code to all staff**
- [ ] **Create training materials**

---

## 🎯 Go-Live Checklist

### Final Verification

- [ ] **All tests passing**
- [ ] **No critical bugs**
- [ ] **Performance acceptable**
- [ ] **Security verified**
- [ ] **Backups configured**
- [ ] **Monitoring active**
- [ ] **Documentation complete**

### Communication

- [ ] **Notify stakeholders of go-live date**
- [ ] **Send employee codes to staff**
- [ ] **Provide access instructions**
- [ ] **Share support contact info**

### Launch

- [ ] **Enable production mode**
- [ ] **Make final backup**
- [ ] **Deploy to production**
- [ ] **Verify everything works**
- [ ] **Monitor for issues**
- [ ] **Celebrate! 🎉**

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Immediate Response**
   - [ ] Switch to maintenance mode
   - [ ] Notify users
   - [ ] Identify the issue

2. **Rollback Steps**
   - [ ] Revert to previous deployment (Git tag)
   - [ ] Restore database backup (if needed)
   - [ ] Clear CDN cache
   - [ ] Verify rollback successful

3. **Post-Incident**
   - [ ] Document what went wrong
   - [ ] Fix the issue
   - [ ] Test thoroughly
   - [ ] Plan next deployment

---

## 📞 Support Contacts

After deployment, maintain a list of:

- **Hosting Provider Support:** [Provider support URL]
- **Database (Supabase) Support:** support@supabase.com
- **Development Team:** [Your contact info]
- **System Administrator:** [Admin contact]

---

## ✅ Deployment Complete!

Once all items are checked:

🎉 **Congratulations!** Your system is live!

### What's Next?

1. **Monitor the system** for the first 24-48 hours
2. **Gather user feedback**
3. **Plan feature enhancements** (Inventory, Orders, Sales)
4. **Iterate and improve**

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Production URL:** _________________  
**Status:** ⬜ In Progress  ⬜ Complete  

---

**Good luck with your deployment!** 🚀
