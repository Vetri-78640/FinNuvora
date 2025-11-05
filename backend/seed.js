const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seed = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await prisma.holding.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);

    const user1 = await prisma.user.create({
      data: {
        email: 'john@example.com',
        password: hashedPassword1,
        name: 'John Doe'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'jane@example.com',
        password: hashedPassword2,
        name: 'Jane Smith'
      }
    });

    console.log('Users created:', user1.email, user2.email);

    // Create portfolios for user1
    const portfolio1 = await prisma.portfolio.create({
      data: {
        userId: user1.id,
        name: 'Tech Stocks',
        description: 'My technology stocks portfolio'
      }
    });

    const portfolio2 = await prisma.portfolio.create({
      data: {
        userId: user1.id,
        name: 'Blue Chip',
        description: 'Stable dividend stocks'
      }
    });

    // Create portfolio for user2
    const portfolio3 = await prisma.portfolio.create({
      data: {
        userId: user2.id,
        name: 'Growth Portfolio',
        description: 'High growth potential stocks'
      }
    });

    console.log('Portfolios created:', portfolio1.name, portfolio2.name, portfolio3.name);

    // Create holdings for portfolio1 (Tech Stocks)
    const holding1 = await prisma.holding.create({
      data: {
        portfolioId: portfolio1.id,
        symbol: 'AAPL',
        quantity: 10,
        buyPrice: 150.00,
        currentPrice: 185.50,
        purchaseDate: new Date('2024-01-15')
      }
    });

    const holding2 = await prisma.holding.create({
      data: {
        portfolioId: portfolio1.id,
        symbol: 'MSFT',
        quantity: 5,
        buyPrice: 300.00,
        currentPrice: 380.25,
        purchaseDate: new Date('2024-02-20')
      }
    });

    const holding3 = await prisma.holding.create({
      data: {
        portfolioId: portfolio1.id,
        symbol: 'GOOGL',
        quantity: 8,
        buyPrice: 140.00,
        currentPrice: 165.75,
        purchaseDate: new Date('2024-03-10')
      }
    });

    // Create holdings for portfolio2 (Blue Chip)
    const holding4 = await prisma.holding.create({
      data: {
        portfolioId: portfolio2.id,
        symbol: 'JNJ',
        quantity: 15,
        buyPrice: 155.00,
        currentPrice: 160.50,
        purchaseDate: new Date('2024-01-05')
      }
    });

    const holding5 = await prisma.holding.create({
      data: {
        portfolioId: portfolio2.id,
        symbol: 'PG',
        quantity: 20,
        buyPrice: 145.00,
        currentPrice: 152.25,
        purchaseDate: new Date('2024-02-01')
      }
    });

    // Create holdings for portfolio3 (Growth Portfolio - user2)
    const holding6 = await prisma.holding.create({
      data: {
        portfolioId: portfolio3.id,
        symbol: 'NVDA',
        quantity: 12,
        buyPrice: 250.00,
        currentPrice: 875.50,
        purchaseDate: new Date('2024-01-20')
      }
    });

    const holding7 = await prisma.holding.create({
      data: {
        portfolioId: portfolio3.id,
        symbol: 'TESLA',
        quantity: 7,
        buyPrice: 200.00,
        currentPrice: 285.75,
        purchaseDate: new Date('2024-02-15')
      }
    });

    console.log('Holdings created:', holding1.symbol, holding2.symbol, holding3.symbol, holding4.symbol, holding5.symbol, holding6.symbol, holding7.symbol);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
