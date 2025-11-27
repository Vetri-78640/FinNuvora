# Deployment

Guide for deploying FinNuvora to production.

## Environment Variables

### Backend (.env)

```env
# Server
PORT=4000
NODE_ENV=production

# Database
MONGODB_URI=your_mongodb_atlas_uri

# Authentication
JWT_SECRET=your_secure_jwt_secret

# APIs
GEMINI_API_KEY=your_gemini_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_production_secret
PLAID_ENV=production
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.finnuvora.com
```

## Deployment Platforms

### Backend

**Recommended:** Railway, Render, or Heroku

**Steps:**
1. Create account on platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend

**Recommended:** Vercel (optimized for Next.js)

**Steps:**
1. Create Vercel account
2. Import GitHub repository
3. Set environment variables
4. Deploy

### Database

**MongoDB Atlas** (already cloud-hosted)

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use production API keys
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up error tracking
- [ ] Enable rate limiting
- [ ] Review security settings

---

[[07-Development-Guide|← Previous: Development Guide]] | [[README|Back to Index]]
