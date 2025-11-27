require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectMongoDB = require('./config/mongodb');
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');
const Holding = require('./models/Holding');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const PriceHistory = require('./models/PriceHistory');

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();

    console.log('Clearing existing data...');
    await Promise.all([
      Holding.deleteMany({}),
      Portfolio.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Goal.deleteMany({}),
      PriceHistory.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log('Creating users...');
    const [john, jane] = await Promise.all([
      User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
      }),
      User.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password456', 10),
      }),
    ]);

    console.log('Creating portfolios...');
    const [tech, blueChip, growth] = await Promise.all([
      Portfolio.create({
        user: john._id,
        name: 'Tech Stocks',
        description: 'My technology stocks portfolio',
      }),
      Portfolio.create({
        user: john._id,
        name: 'Blue Chip',
        description: 'Stable dividend stocks',
      }),
      Portfolio.create({
        user: jane._id,
        name: 'Growth Portfolio',
        description: 'High growth potential stocks',
      }),
    ]);

    console.log('Creating holdings...');
    await Holding.insertMany([
      {
        portfolio: tech._id,
        symbol: 'AAPL',
        quantity: 10,
        buyPrice: 150,
        currentPrice: 185.5,
        purchaseDate: new Date('2024-01-15'),
      },
      {
        portfolio: tech._id,
        symbol: 'MSFT',
        quantity: 5,
        buyPrice: 300,
        currentPrice: 380.25,
        purchaseDate: new Date('2024-02-20'),
      },
      {
        portfolio: tech._id,
        symbol: 'GOOGL',
        quantity: 8,
        buyPrice: 140,
        currentPrice: 165.75,
        purchaseDate: new Date('2024-03-10'),
      },
      {
        portfolio: blueChip._id,
        symbol: 'JNJ',
        quantity: 15,
        buyPrice: 155,
        currentPrice: 160.5,
        purchaseDate: new Date('2024-01-05'),
      },
      {
        portfolio: blueChip._id,
        symbol: 'PG',
        quantity: 20,
        buyPrice: 145,
        currentPrice: 152.25,
        purchaseDate: new Date('2024-02-01'),
      },
      {
        portfolio: growth._id,
        symbol: 'NVDA',
        quantity: 12,
        buyPrice: 250,
        currentPrice: 875.5,
        purchaseDate: new Date('2024-01-20'),
      },
      {
        portfolio: growth._id,
        symbol: 'TSLA',
        quantity: 7,
        buyPrice: 200,
        currentPrice: 285.75,
        purchaseDate: new Date('2024-02-15'),
      },
    ]);

    console.log('Creating categories...');
    const [salary, rent, groceries, investing, janeSalary, janeUtilities, janeEntertainment] = await Category.insertMany([
      { user: john._id, name: 'Salary', color: '#4ade80' },
      { user: john._id, name: 'Rent', color: '#f87171' },
      { user: john._id, name: 'Groceries', color: '#60a5fa' },
      { user: john._id, name: 'Investing', color: '#facc15' },
      { user: jane._id, name: 'Salary', color: '#4ade80' },
      { user: jane._id, name: 'Utilities', color: '#f87171' },
      { user: jane._id, name: 'Entertainment', color: '#a78bfa' },
    ]);

    console.log('Creating transactions...');
    await Transaction.insertMany([
      {
        user: john._id,
        category: salary._id,
        type: 'income',
        amount: 5000,
        description: 'Monthly salary',
        date: new Date('2024-04-01'),
      },
      {
        user: john._id,
        category: rent._id,
        type: 'expense',
        amount: 1500,
        description: 'Apartment rent',
        date: new Date('2024-04-03'),
      },
      {
        user: john._id,
        category: groceries._id,
        type: 'expense',
        amount: 450,
        description: 'Groceries and supplies',
        date: new Date('2024-04-05'),
      },
      {
        user: john._id,
        category: investing._id,
        type: 'investment',
        amount: 800,
        description: 'Added to investment account',
        date: new Date('2024-04-07'),
      },
      {
        user: jane._id,
        category: janeSalary._id,
        type: 'income',
        amount: 4500,
        description: 'Monthly salary',
        date: new Date('2024-04-01'),
      },
      {
        user: jane._id,
        category: janeUtilities._id,
        type: 'expense',
        amount: 200,
        description: 'Electric and water bills',
        date: new Date('2024-04-02'),
      },
      {
        user: jane._id,
        category: janeEntertainment._id,
        type: 'expense',
        amount: 150,
        description: 'Movie and dinner out',
        date: new Date('2024-04-04'),
      },
    ]);

    console.log('Creating goals...');
    await Goal.insertMany([
      {
        user: john._id,
        title: 'Emergency Fund',
        description: 'Save up for six months of expenses',
        targetAmount: 10000,
        currentAmount: 3500,
        deadline: new Date('2025-01-01'),
        status: 'active',
      },
      {
        user: john._id,
        title: 'Vacation Fund',
        description: 'Trip to Japan',
        targetAmount: 4000,
        currentAmount: 1200,
        deadline: new Date('2024-10-01'),
        status: 'active',
      },
      {
        user: jane._id,
        title: 'Car Fund',
        description: 'Save for a new car',
        targetAmount: 25000,
        currentAmount: 8500,
        deadline: new Date('2025-06-01'),
        status: 'active',
      },
      {
        user: jane._id,
        title: 'Laptop Upgrade',
        description: 'New MacBook Pro',
        targetAmount: 2500,
        currentAmount: 1800,
        deadline: new Date('2024-12-31'),
        status: 'active',
      },
    ]);

    console.log('Creating sample price history...');
    await PriceHistory.insertMany([
      {
        user: john._id,
        symbol: 'AAPL',
        price: 185.5,
        timestamp: new Date('2024-04-01T10:00:00Z'),
        source: 'seed',
      },
      {
        user: john._id,
        symbol: 'AAPL',
        price: 188.1,
        timestamp: new Date('2024-04-02T10:00:00Z'),
        source: 'seed',
      },
      {
        user: john._id,
        symbol: 'MSFT',
        price: 380.25,
        timestamp: new Date('2024-04-01T10:00:00Z'),
        source: 'seed',
      },
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
