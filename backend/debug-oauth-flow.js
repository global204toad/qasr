#!/usr/bin/env node

/**
 * OAuth Flow Debug Tool
 * This will help us identify exactly what's going wrong
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

async function debugOAuthFlow() {
  console.log(`
🔍 OAUTH FLOW DEBUG
==================

Let's check what's happening step by step...
`);

  // 1. Check environment variables
  console.log('1. ENVIRONMENT VARIABLES:');
  console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : '❌ Missing');
  console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : '❌ Missing');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : '❌ Missing');
  console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
  console.log('   BACKEND_URL:', process.env.BACKEND_URL || 'http://localhost:5000');
  console.log('');

  // 2. Test database connection
  console.log('2. DATABASE CONNECTION:');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('   ✅ MongoDB: Connected');
    
    const User = require('./models/User');
    const testUser = await User.findOne().limit(1);
    console.log('   ✅ User model: Working');
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ Database error:', error.message);
  }
  console.log('');

  // 3. Check if servers are running
  console.log('3. SERVER STATUS:');
  
  // Check backend
  const http = require('http');
  const checkServer = (port, name) => {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        resolve(`✅ ${name}: Running on port ${port}`);
      });
      req.on('error', () => {
        resolve(`❌ ${name}: Not running on port ${port}`);
      });
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(`❌ ${name}: Timeout on port ${port}`);
      });
    });
  };

  const backendStatus = await checkServer(5000, 'Backend');
  const frontendStatus = await checkServer(3000, 'Frontend');
  
  console.log('  ', backendStatus);
  console.log('  ', frontendStatus);
  console.log('');

  // 4. Test OAuth endpoints
  console.log('4. OAUTH ENDPOINT TEST:');
  try {
    const req = http.get('http://localhost:5000/api/auth/google', (res) => {
      if (res.statusCode === 302) {
        console.log('   ✅ OAuth endpoint: Working (redirects to Google)');
        console.log('   ✅ Redirect location:', res.headers.location);
      } else {
        console.log('   ❌ OAuth endpoint: Unexpected status', res.statusCode);
      }
    });
    req.on('error', (error) => {
      console.log('   ❌ OAuth endpoint: Error -', error.message);
    });
    req.setTimeout(3000, () => {
      req.destroy();
      console.log('   ❌ OAuth endpoint: Timeout');
    });
  } catch (error) {
    console.log('   ❌ OAuth endpoint test failed:', error.message);
  }

  // Wait a moment for async operations
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log(`
5. DEBUGGING STEPS:
==================

If the OAuth still doesn't work, let's debug:

A) Check browser console:
   1. Open http://localhost:3000/sign-in
   2. Open browser developer tools (F12)
   3. Click "Continue with Google"
   4. Check Console tab for errors
   5. Check Network tab for failed requests

B) Check server logs:
   1. Look at your backend terminal
   2. Should see "🔍 Google OAuth profile:" when OAuth works
   3. Look for any error messages

C) Common issues:
   ❌ "redirect_uri_mismatch" → Check Google Console redirect URIs
   ❌ "access_blocked" → Add your email as test user in Google Console
   ❌ Network errors → Check if both servers are running
   ❌ "Invalid client" → Verify Client ID/Secret in .env

D) Manual test:
   1. Visit: http://localhost:5000/api/auth/google
   2. Should redirect to Google login
   3. After login, should redirect to: http://localhost:3000/oauth-callback?token=...

E) Check Google Cloud Console:
   ✅ Authorized JavaScript origins: http://localhost:3000
   ✅ Authorized redirect URIs: http://localhost:5000/api/auth/google/callback
   ✅ OAuth consent screen configured
   ✅ Your email added as test user

6. NEXT STEPS:
=============

1. Start both servers if not running:
   Backend: cd backend && npm run dev
   Frontend: cd frontend && npm run dev

2. Test the flow and check browser console for errors

3. If still not working, run this command to see detailed logs:
   cd backend && DEBUG=passport:* npm run dev

Let me know what errors you see!
`);

  process.exit(0);
}

debugOAuthFlow().catch(console.error);

