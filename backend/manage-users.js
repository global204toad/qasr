// Manage users in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function manageUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const action = process.argv[2];
    const email = process.argv[3];
    
    if (!action) {
      console.log('\n📋 Available Actions:');
      console.log('=====================');
      console.log('1. delete <email> - Delete a specific user');
      console.log('2. reset <email> - Reset verification status for a user');
      console.log('3. delete-all - Delete all users (DANGEROUS!)');
      console.log('4. list - List all users');
      console.log('\nExample: node manage-users.js delete aliashrafosman777@gmail.com');
      return;
    }
    
    switch (action) {
      case 'delete':
        if (!email) {
          console.log('❌ Please provide an email address');
          return;
        }
        const deletedUser = await User.findOneAndDelete({ email });
        if (deletedUser) {
          console.log(`✅ Deleted user: ${deletedUser.name} (${deletedUser.email})`);
        } else {
          console.log(`❌ No user found with email: ${email}`);
        }
        break;
        
      case 'reset':
        if (!email) {
          console.log('❌ Please provide an email address');
          return;
        }
        const resetUser = await User.findOneAndUpdate(
          { email },
          { 
            isVerified: false,
            verificationCode: undefined,
            verificationCodeExpires: undefined
          },
          { new: true }
        );
        if (resetUser) {
          console.log(`✅ Reset verification for: ${resetUser.name} (${resetUser.email})`);
          console.log(`   Verification status: ${resetUser.isVerified ? '✅ Verified' : '❌ Not Verified'}`);
        } else {
          console.log(`❌ No user found with email: ${email}`);
        }
        break;
        
      case 'delete-all':
        const confirm = process.argv[3];
        if (confirm !== '--confirm') {
          console.log('⚠️  WARNING: This will delete ALL users!');
          console.log('To confirm, run: node manage-users.js delete-all --confirm');
          return;
        }
        const result = await User.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users`);
        break;
        
      case 'list':
        const users = await User.find({}).select('name email isVerified provider createdAt');
        console.log('\n📋 Current Users:');
        console.log('================');
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email})`);
          console.log(`   Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
          console.log(`   Provider: ${user.provider}`);
          console.log('   ---');
        });
        break;
        
      default:
        console.log(`❌ Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

manageUsers();
