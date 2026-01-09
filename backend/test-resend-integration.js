/**
 * Test script for Resend email integration
 * This script tests all three email functions:
 * 1. OTP Email
 * 2. Order Confirmation Email
 * 3. Admin Notification Email
 */

require('dotenv').config();
const {
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail
} = require('./utils/emailService');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

// Helper function to log test results
const logResult = (testName, result) => {
    const status = result.success
        ? `${colors.green}✓ PASSED${colors.reset}`
        : `${colors.red}✗ FAILED${colors.reset}`;
    console.log(`${status} ${testName}`);
    if (result.success && result.messageId) {
        console.log(`  ${colors.blue}Message ID: ${result.messageId}${colors.reset}`);
    }
    if (!result.success && result.error) {
        console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
    }
    console.log('');
};

// Mock order data for testing
const createMockOrder = () => ({
    _id: '507f1f77bcf86cd799439011',
    orderNumber: 'ORD-20260108-000001',
    createdAt: new Date(),
    status: 'pending',
    items: [
        {
            name: 'Premium Cashews',
            price: 120.00,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1585813239427-8e11f7e7dd48?w=200',
            weightOption: { label: '500g' }
        },
        {
            name: 'Roasted Almonds',
            price: 95.50,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=200',
            weightOption: { label: '1kg' }
        }
    ],
    shippingAddress: {
        fullName: 'Test Customer',
        address: '123 Test Street, Apartment 4B',
        city: 'Cairo',
        state: 'Cairo Governorate',
        zipCode: '11511',
        country: 'Egypt',
        phone: '+20 123 456 7890'
    },
    pricing: {
        itemsPrice: 335.50,
        shippingPrice: 0,
        totalPrice: 335.50
    },
    paymentInfo: {
        method: 'cash_on_delivery',
        status: 'pending'
    },
    notes: {
        customer: 'Please deliver after 6 PM'
    }
});

// Main test function
const runTests = async () => {
    console.log(`\n${colors.bold}${colors.blue}==================================${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}  Resend Email Integration Tests  ${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}==================================${colors.reset}\n`);

    // Check environment variables
    console.log(`${colors.yellow}Checking configuration...${colors.reset}`);
    console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? colors.green + '✓ Set' : colors.red + '✗ Missing'}${colors.reset}`);
    console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? colors.green + '✓ ' + process.env.ADMIN_EMAIL : colors.red + '✗ Missing'}${colors.reset}`);
    console.log(`FROM_EMAIL_AUTH: ${process.env.FROM_EMAIL_AUTH || 'onboarding@resend.dev (default)'}${colors.reset}`);
    console.log(`FROM_EMAIL_ORDERS: ${process.env.FROM_EMAIL_ORDERS || 'onboarding@resend.dev (default)'}${colors.reset}`);
    console.log(`FROM_EMAIL_NOTIFICATIONS: ${process.env.FROM_EMAIL_NOTIFICATIONS || 'onboarding@resend.dev (default)'}${colors.reset}\n`);

    if (!process.env.RESEND_API_KEY) {
        console.log(`${colors.red}${colors.bold}ERROR: RESEND_API_KEY is not set in .env file${colors.reset}`);
        console.log(`${colors.yellow}Please add RESEND_API_KEY to your .env file and try again.${colors.reset}\n`);
        process.exit(1);
    }

    // Get test email from user input or use admin email
    const testEmail = process.env.ADMIN_EMAIL || 'nourabdelreheemali@gmail.com';
    console.log(`${colors.yellow}Using test email: ${testEmail}${colors.reset}\n`);

    // Test 1: OTP Email
    console.log(`${colors.bold}Test 1: OTP Email (New User)${colors.reset}`);
    const otpResult = await sendOTPEmail(testEmail, '123456', true);
    logResult('Send OTP Email', otpResult);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: OTP Email (Returning User)
    console.log(`${colors.bold}Test 2: OTP Email (Returning User)${colors.reset}`);
    const otpResult2 = await sendOTPEmail(testEmail, '654321', false);
    logResult('Send OTP Email (Returning)', otpResult2);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Order Confirmation Email
    console.log(`${colors.bold}Test 3: Order Confirmation Email${colors.reset}`);
    const mockOrder = createMockOrder();
    const orderConfirmResult = await sendOrderConfirmationEmail(
        mockOrder,
        testEmail,
        'Test Customer'
    );
    logResult('Send Order Confirmation', orderConfirmResult);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Admin Notification Email
    console.log(`${colors.bold}Test 4: Admin Notification Email${colors.reset}`);
    const adminNotifyResult = await sendAdminNotificationEmail(mockOrder);
    logResult('Send Admin Notification', adminNotifyResult);

    // Summary
    console.log(`\n${colors.bold}${colors.blue}==================================${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}        Test Summary              ${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}==================================${colors.reset}\n`);

    const results = [otpResult, otpResult2, orderConfirmResult, adminNotifyResult];
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Total Tests: ${results.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}\n`);

    if (failed === 0) {
        console.log(`${colors.green}${colors.bold}✓ All tests passed!${colors.reset}`);
        console.log(`${colors.yellow}Check your email inbox (${testEmail}) for the test emails.${colors.reset}\n`);
    } else {
        console.log(`${colors.red}${colors.bold}✗ Some tests failed. Check the errors above.${colors.reset}\n`);
    }
};

// Run tests
runTests().catch(error => {
    console.error(`\n${colors.red}${colors.bold}Test execution failed:${colors.reset}`, error);
    process.exit(1);
});
