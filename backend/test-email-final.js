/**
 * Final verification test for Resend email integration
 * Tests all three email functions with confirmed working sender
 */

require('dotenv').config();
const {
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail
} = require('./utils/emailService');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

const mockOrder = {
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
};

async function runFinalTest() {
    console.log(`\n${colors.bold}${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}    ALKASR - Email Integration Test     ${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}========================================${colors.reset}\n`);

    const testEmail = process.env.ADMIN_EMAIL || 'nourabdelreheemali@gmail.com';
    console.log(`${colors.yellow}📧 Test email: ${testEmail}${colors.reset}\n`);

    let passed = 0;
    let failed = 0;

    // Test 1: OTP Email (New User)
    console.log(`${colors.bold}Test 1/4: OTP Email (New User)${colors.reset}`);
    try {
        const result = await sendOTPEmail(testEmail, '123456', true);
        if (result.success) {
            console.log(`${colors.green}✓ PASSED${colors.reset} - Message ID: ${result.messageId}\n`);
            passed++;
        } else {
            console.log(`${colors.red}✗ FAILED${colors.reset} - ${result.error || result.message}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`${colors.red}✗ FAILED${colors.reset} - ${err.message}\n`);
        failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: OTP Email (Returning User)
    console.log(`${colors.bold}Test 2/4: OTP Email (Returning User)${colors.reset}`);
    try {
        const result = await sendOTPEmail(testEmail, '654321', false);
        if (result.success) {
            console.log(`${colors.green}✓ PASSED${colors.reset} - Message ID: ${result.messageId}\n`);
            passed++;
        } else {
            console.log(`${colors.red}✗ FAILED${colors.reset} - ${result.error || result.message}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`${colors.red}✗ FAILED${colors.reset} - ${err.message}\n`);
        failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Order Confirmation Email
    console.log(`${colors.bold}Test 3/4: Order Confirmation Email${colors.reset}`);
    try {
        const result = await sendOrderConfirmationEmail(mockOrder, testEmail, 'Test Customer');
        if (result.success) {
            console.log(`${colors.green}✓ PASSED${colors.reset} - Message ID: ${result.messageId}\n`);
            passed++;
        } else {
            console.log(`${colors.red}✗ FAILED${colors.reset} - ${result.error || result.message}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`${colors.red}✗ FAILED${colors.reset} - ${err.message}\n`);
        failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Admin Notification Email
    console.log(`${colors.bold}Test 4/4: Admin Notification Email${colors.reset}`);
    try {
        const result = await sendAdminNotificationEmail(mockOrder);
        if (result.success) {
            console.log(`${colors.green}✓ PASSED${colors.reset} - Message ID: ${result.messageId}\n`);
            passed++;
        } else {
            console.log(`${colors.red}✗ FAILED${colors.reset} - ${result.error || result.message}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`${colors.red}✗ FAILED${colors.reset} - ${err.message}\n`);
        failed++;
    }

    // Summary
    console.log(`${colors.bold}${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}             Test Summary               ${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}========================================${colors.reset}\n`);

    console.log(`Total Tests: 4`);
    console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}\n`);

    if (failed === 0) {
        console.log(`${colors.green}${colors.bold}🎉 ALL TESTS PASSED!${colors.reset}\n`);
        console.log(`${colors.yellow}📬 Check your inbox at: ${testEmail}${colors.reset}`);
        console.log(`${colors.yellow}You should have received 4 emails:${colors.reset}`);
        console.log(`   1. OTP Code: 123456 (New User)`);
        console.log(`   2. OTP Code: 654321 (Returning User)`);
        console.log(`   3. Order Confirmation #ORD-20260108-000001`);
        console.log(`   4. Admin Notification #ORD-20260108-000001\n`);
        console.log(`${colors.green}✅ Email integration is working perfectly!${colors.reset}\n`);
    } else {
        console.log(`${colors.red}${colors.bold}⚠️  Some tests failed${colors.reset}`);
        console.log(`${colors.yellow}Check the errors above and verify:${colors.reset}`);
        console.log(`   - Resend API key is correct`);
        console.log(`   - Sender emails are properly configured`);
        console.log(`   - Domain qasrnuts.com is verified\n`);
    }
}

runFinalTest().catch(error => {
    console.error(`\n${colors.red}${colors.bold}Test execution failed:${colors.reset}`, error);
    process.exit(1);
});
