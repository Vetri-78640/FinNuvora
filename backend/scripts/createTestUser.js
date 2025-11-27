require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testUser = {
            email: 'test@example.com',
            password: 'Test123!',
            name: 'Test User'
        };

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testUser.password, salt);

        // Create user
        const user = await User.create({
            email: testUser.email,
            password: hashedPassword,
            name: testUser.name,
            currency: 'USD',
            accountBalance: 0
        });

        console.log('✅ Test user created successfully!');
        console.log('\n📧 Login Credentials:');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);
        console.log('\n🌐 Login at: http://localhost:3000/auth/login');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
