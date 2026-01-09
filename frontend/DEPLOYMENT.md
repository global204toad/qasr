# Vercel Deployment Guide - El Qaser 4

## Quick Start Deployment

### Prerequisites Checklist
- ✅ MongoDB Atlas account with cluster created
- ✅ Vercel account (free tier works)
- ✅ Resend API key for emails
- ✅ Git repository (optional but recommended)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Get Your Connection String
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 1.2 Whitelist Vercel IPs
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

**Why:** Vercel serverless functions use dynamic IPs, so we need to allow all IPs.

---

## Step 2: Get Your API Keys

### 2.1 Resend API Key
1. Go to [Resend](https://resend.com/)
2. Sign up/login
3. Go to API Keys
4. Create new API key
5. Copy the key (starts with `re_`)

### 2.2 Stripe Keys (Optional - for online payments)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your test keys from Developers → API keys
3. Copy both:
   - Secret key (sk_test_...)
   - Publishable key (pk_test_...)

**Note:** You can skip Stripe for now - cash on delivery will work!

---

## Step 3: Install Vercel CLI

```bash
npm install -g vercel
```

Then login:
```bash
vercel login
```

---

## Step 4: Deploy to Vercel

### 4.1 Navigate to Frontend Directory
```bash
cd "f:\\el qaser 4\\frontend"
```

### 4.2 Deploy
```bash
vercel
```

**You'll be asked:**
1. "Set up and deploy?" → **Yes**
2. "Which scope?" → Choose your account
3. "Link to existing project?" → **No**
4. "What's your project's name?" → **el-qaser-4** (or your choice)
5. "In which directory is your code located?" → **./** (current directory)
6. "Want to override settings?" → **No**

**Wait for deployment...** ☕

---

## Step 5: Add Environment Variables in Vercel

### 5.1 Go to Vercel Dashboard
1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (el-qaser-4)
3. Go to "Settings" → "Environment Variables"

### 5.2 Add Each Variable

**Required Variables:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string | Production, Preview, Development |
| `JWT_SECRET` | Random secret (e.g., `openssl rand -base64 32`) | Production, Preview, Development |
| `RESEND_API_KEY` | Your Resend API key | Production, Preview, Development |
| `FROM_EMAIL_AUTH` | auth@qasrnuts.com | Production, Preview, Development |
| `FROM_EMAIL_ORDERS` | orders@qasrnuts.com | Production, Preview, Development |
| `ADMIN_EMAIL` | admin@qasrnuts.com | Production, Preview, Development |
| `NODE_ENV` | production | Production, Preview |

**Optional Variables (for Stripe):**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `STRIPE_SECRET_KEY` | sk_test_... | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_... | Production, Preview, Development |

**How to add:**
1. Click "Add New"
2. Enter variable name
3. Enter value
4. Select environments (check all three: Production, Preview, Development)
5. Click "Save"
6. Repeat for each variable

---

## Step 6: Redeploy

After adding environment variables:

```bash
vercel --prod
```

This deploys to production with your environment variables.

---

## Step 7: Test Your Deployment

### 7.1 Get Your URL
Vercel will give you a URL like: `https://el-qaser-4.vercel.app`

### 7.2 Test These Endpoints

**Health Check:**
```
https://your-app.vercel.app/api/health
```

**Products:**
```
https://your-app.vercel.app/api/products
```

**Featured Products:**
```
https://your-app.vercel.app/api/products/featured
```

### 7.3 Test Full Flow
1. Open your app URL
2. Browse products
3. Sign up with email (check inbox for OTP)
4. Add items to cart
5. Checkout
6. Check email for order confirmation

---

## Step 8: Configure Custom Domain (Optional)

### 8.1 Add Domain in Vercel
1. Go to Project Settings → Domains
2. Add `qasrnuts.com`
3. Follow DNS configuration instructions

### 8.2 Update DNS Records
Add these records to your domain registrar:

**For root domain (qasrnuts.com):**
- Type: A
- Name: @
- Value: 76.76.21.21

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution:**
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify MONGODB_URI is correct in Vercel environment variables
- Check MongoDB Atlas cluster is running

### Issue: "Email not sending"
**Solution:**
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for errors
- Verify FROM_EMAIL_AUTH domain is verified in Resend

### Issue: "Build failed"
**Solution:**
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Try building locally: `npm run build`

### Issue: "API routes return 404"
**Solution:**
- Ensure files are in `pages/api/` directory
- Check file naming (lowercase, correct extensions)
- Redeploy after changes

---

## Local Testing Before Deployment

### Create .env.local
```bash
cd "f:\\el qaser 4\\frontend"
copy .env.example .env.local
```

Then edit `.env.local` with your actual values.

### Test Locally
```bash
npm run dev
```

Test all features:
- ✅ Authentication (send OTP, verify)
- ✅ Browse products
- ✅ Add to cart
- ✅ Checkout
- ✅ View orders

### Build Test
```bash
npm run build
npm start
```

If build succeeds locally, it will succeed on Vercel!

---

## Monitoring Your Deployment

### Vercel Dashboard
- **Functions:** See API route execution times
- **Logs:** Real-time logs for debugging
- **Analytics:** Traffic and performance metrics

### MongoDB Atlas
- **Metrics:** Database performance
- **Alerts:** Set up alerts for issues

---

## Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```

---

## What Works After Deployment

✅ **Authentication**
- Email OTP login/register
- JWT token management
- Protected routes

✅ **Products**
- Browse with filters
- Search
- Categories
- Product details

✅ **Shopping Cart**
- Add/remove items
- Update quantities
- Weight options

✅ **Checkout**
- Cash on delivery
- Order processing
- Email confirmations

✅ **Orders**
- Order history
- Order details

⏳ **Not Yet Implemented**
- Stripe payments (cash on delivery works)
- Admin panel

---

## Next Steps After Deployment

1. **Test thoroughly** in production
2. **Monitor logs** for any errors
3. **Add Stripe** for online payments (Phase 2C)
4. **Add admin panel** for order management (Phase 2C)
5. **Set up custom domain** (qasrnuts.com)

---

## Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Check MongoDB Atlas metrics
3. Verify all environment variables are set
4. Test locally first with same environment variables

---

**You're ready to deploy! 🚀**

Just run:
```bash
cd "f:\\el qaser 4\\frontend"
vercel
```

And follow the prompts!
