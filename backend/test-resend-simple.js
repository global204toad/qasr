// Simple test to verify Resend API key and basic functionality
require('dotenv').config();
const { Resend } = require('resend');

async function testResendAPI() {
    console.log('\n🔍 Testing Resend API Configuration...\n');

    // Check API key
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not found in environment variables');
        return;
    }

    console.log('✓ API Key found:', process.env.RESEND_API_KEY.substring(0, 10) + '...');

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✓ Resend client initialized\n');

    // Try to send a test email
    console.log('📧 Attempting to send test email...\n');

    try {
        const { data, error } = await resend.emails.send({
            from: 'delivered@resend.dev',
            to: process.env.ADMIN_EMAIL || 'nourabdelreheemali@gmail.com',
            subject: 'Resend API Test - ALKASR',
            html: '<h1>Test Email</h1><p>This is a test email from ALKASR to verify Resend API integration.</p>'
        });

        if (error) {
            console.error('❌ Email send failed:');
            console.error('Error details:', JSON.stringify(error, null, 2));
            return;
        }

        console.log('✓ Email sent successfully!');
        console.log('Message ID:', data.id);
        console.log('\n✅ Resend API is working correctly!');
        console.log('📬 Check your inbox at:', process.env.ADMIN_EMAIL || 'nourabdelreheemali@gmail.com');

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        console.error(err);
    }
}

testResendAPI();
