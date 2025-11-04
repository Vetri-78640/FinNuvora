FinNuvora - Financial Management Platform

A full-stack web application for managing investments and portfolios.

Project Structure:
- backend/  - Express.js API server
- frontend/ - React/Next.js web application

Getting Started:

1. Database Setup:
   - Create a MySQL database named 'finnuvora'
   - Update DATABASE_URL in backend/.env with your credentials

2. Backend:
   cd backend
   npm install
   npm run dev

3. Frontend:
   cd frontend
   npm install
   npm run dev

Tech Stack:
- Backend: Express.js, Prisma ORM, MySQL, JWT
- Frontend: React/Next.js

API Endpoints:
- POST /api/auth/register  - Register new user
- POST /api/auth/login     - Login user
- GET /api/user/profile    - Get user profile
- POST /api/portfolio      - Create portfolio
- GET /api/portfolio       - Get user portfolios

Team: Vetri (Capstone Project)
