#!/usr/bin/env node

/**
 * OAuth Diagnostic Tool
 * This script will help identify and fix OAuth issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

async function diagnoseOAuth() {
  console.log(`
🔍 OAUTH DIAGNOSTIC TOOL
========================

Checking your OAuth configuration...
`);

  // 1. Environment Variables Check
  console.log('1. ENVIRONMENT VARIABLES:');
  console.log('✅ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : '❌ Missing');
  console.log('✅ GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : '❌ Missing');
  console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : '❌ Missing');
  console.log('✅ MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✓' : '❌ Missing');
  console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');
  console.log('✅ BACKEND_URL:', process.env.BACKEND_URL || 'Using default');
  console.log('');

  // 2. Database Connection Test
  console.log('2. DATABASE CONNECTION:');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ MongoDB connection: Success ✓');
    
    // Test User model
    const User = require('./models/User');
    console.log('✅ User model: Loaded ✓');
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection: Failed');
    console.log('   Error:', error.message);
  }
  console.log('');

  // 3. Server Endpoints Check
  console.log('3. SERVER ENDPOINTS:');
  try {
    // Check if backend server is running
    const healthResponse = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
    console.log('✅ Backend server: Running ✓');
    
    // Check OAuth endpoints
    try {
      const authResponse = await axios.get('http://localhost:5000/api/auth/google', { 
        timeout: 3000,
        maxRedirects: 0,
        validateStatus: (status) => status === 302 // Expect redirect
      });
      console.log('✅ Google OAuth endpoint: Working ✓');
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log('✅ Google OAuth endpoint: Working ✓');
      } else if (error.response && error.response.status === 501) {
        console.log('❌ Google OAuth endpoint: Not configured (missing credentials)');
      } else {
        console.log('❌ Google OAuth endpoint: Error -', error.message);
      }
    }
  } catch (error) {
    console.log('❌ Backend server: Not running');
    console.log('   Please start backend with: npm run dev');
  }
  console.log('');

  // 4. Frontend Server Check
  console.log('4. FRONTEND SERVER:');
  try {
    await axios.get('http://localhost:3000', { timeout: 3000 });
    console.log('✅ Frontend server: Running ✓');
  } catch (error) {
    console.log('❌ Frontend server: Not running');
    console.log('   Please start frontend with: cd frontend && npm run dev');
  }
  console.log('');

  // 5. Google Cloud Console Configuration
  console.log('5. GOOGLE CLOUD CONSOLE SETUP:');
  console.log('');
  console.log('🔧 REQUIRED GOOGLE CLOUD CONSOLE SETTINGS:');
  console.log('─────────────────────────────────────────');
  console.log('');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Select your project or create a new one');
  console.log('3. Enable APIs:');
  console.log('   - Google+ API');
  console.log('   - Google OAuth2 API');
  console.log('');
  console.log('4. Create OAuth 2.0 Credentials:');
  console.log('   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"');
  console.log('   - Application type: "Web application"');
  console.log('');
  console.log('5. Configure Authorized JavaScript origins:');
  console.log('   ✅ http://localhost:3000');
  console.log('   ✅ http://127.0.0.1:3000');
  console.log('');
  console.log('6. Configure Authorized redirect URIs:');
  console.log('   ✅ http://localhost:5000/api/auth/google/callback');
  console.log('   ✅ http://127.0.0.1:5000/api/auth/google/callback');
  console.log('');
  console.log('7. OAuth Consent Screen:');
  console.log('   - Set up OAuth consent screen');
  console.log('   - Add your email as a test user (if in testing mode)');
  console.log('   - Verify domain if needed');
  console.log('');

  // 6. Common Issues and Solutions
  console.log('6. COMMON ISSUES & SOLUTIONS:');
  console.log('─────────────────────────────');
  console.log('');
  console.log('❌ "redirect_uri_mismatch" error:');
  console.log('   → Check authorized redirect URIs in Google Console');
  console.log('   → Must exactly match: http://localhost:5000/api/auth/google/callback');
  console.log('');
  console.log('❌ "access_blocked" error:');
  console.log('   → Add your email as test user in OAuth consent screen');
  console.log('   → Or publish your OAuth app');
  console.log('');
  console.log('❌ User not logged in after OAuth:');
  console.log('   → Check browser cookies for "token"');
  console.log('   → Check localStorage for "token"');
  console.log('   → Verify both servers are running');
  console.log('');
  console.log('❌ "Client ID not found" error:');
  console.log('   → Verify GOOGLE_CLIENT_ID in .env file');
  console.log('   → Restart backend server after changing .env');
  console.log('');

  // 7. Test Commands
  console.log('7. TEST COMMANDS:');
  console.log('─────────────────');
  console.log('');
  console.log('Test OAuth flow manually:');
  console.log('1. Visit: http://localhost:3000/sign-in');
  console.log('2. Click "Continue with Google"');
  console.log('3. Complete Google authentication');
  console.log('4. Check browser console for errors');
  console.log('5. Check browser cookies for "token"');
  console.log('');
  
  console.log('Debug OAuth callback:');
  console.log('1. Open browser developer tools');
  console.log('2. Go to Network tab');
  console.log('3. Start OAuth flow');
  console.log('4. Check network requests for errors');
  console.log('');

  // 8. Your Current Configuration
  console.log('8. YOUR CURRENT CONFIGURATION:');
  console.log('─────────────────────────────');
  console.log('');
  console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID || '❌ Not set');
  console.log('OAuth Callback URL: http://localhost:5000/api/auth/google/callback');
  console.log('Frontend URL: http://localhost:3000');
  console.log('');
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('🎉 CREDENTIALS ARE CONFIGURED!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify Google Cloud Console settings above');
    console.log('2. Start both servers (backend & frontend)');
    console.log('3. Test the OAuth flow');
    console.log('4. Check browser developer tools for errors');
  } else {
    console.log('❌ GOOGLE OAUTH CREDENTIALS MISSING!');
    console.log('');
    console.log('Please add to your .env file:');
    console.log('GOOGLE_CLIENT_ID=your-client-id-here');
    console.log('GOOGLE_CLIENT_SECRET=your-client-secret-here');
  }

  process.exit(0);
}

// Run the diagnostic
diagnoseOAuth().catch(error => {
  console.error('Diagnostic failed:', error);
  process.exit(1);
});
