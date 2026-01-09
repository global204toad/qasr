// Test different sender email formats to find what works
require('dotenv').config();
const { Resend } = require('resend');

async function testDifferentSenders() {
    console.log('\n🔍 Testing Different Sender Email Formats...\n');

    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipient = process.env.ADMIN_EMAIL || 'nourabdelreheemali@gmail.com';

    const sendersToTest = [
        'noreply@qasrnuts.com',
        'info@qasrnuts.com',
        'hello@qasrnuts.com',
        'support@qasrnuts.com',
        'contact@qasrnuts.com',
        'no-reply@qasrnuts.com'
    ];

    console.log(`Testing ${sendersToTest.length} different sender formats...\n`);

    for (const sender of sendersToTest) {
        try {
            console.log(`📧 Testing: ${sender}`);

            const { data, error } = await resend.emails.send({
                from: sender,
                to: recipient,
                subject: `Test from ${sender}`,
                html: `<p>Testing sender: ${sender}</p>`
            });

            if (error) {
                console.log(`   ❌ Failed: ${error.message}\n`);
            } else {
                console.log(`   ✅ SUCCESS! Message ID: ${data.id}\n`);
                console.log(`\n🎉 WORKING SENDER FOUND: ${sender}`);
                console.log(`Update your .env file with this sender!\n`);
                return sender;
            }
        } catch (err) {
            console.log(`   ❌ Error: ${err.message}\n`);
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n❌ None of the sender formats worked.');
    console.log('This might be an API key issue. Please check:');
    console.log('1. API key is from the same Resend account as qasrnuts.com');
    console.log('2. API key has sending permissions');
    console.log('3. No IP restrictions on the API key\n');
}

testDifferentSenders();
