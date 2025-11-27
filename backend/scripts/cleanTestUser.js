require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function cleanTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = 'test@example.com';
        const result = await User.deleteOne({ email: testEmail });

        if (result.deletedCount > 0) {
            console.log(`✅ Deleted existing test user: ${testEmail}`);
        } else {
            console.log(`ℹ️  No existing test user found with email: ${testEmail}`);
        }

        await mongoose.connection.close();
        console.log('✨ Done! You can now register a new account.');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

cleanTestUser();
