# Development Guide

Guide for developers working on FinNuvora.

## Code Style

### JavaScript/Node.js

- Use ES6+ features
- Async/await for asynchronous code
- Descriptive variable names
- Comments for complex logic

### React/Next.js

- Functional components with hooks
- Custom hooks for reusable logic
- Component files in PascalCase
- Props destructuring

## Project Structure

```
backend/
├── config/       # Configuration files
├── controllers/  # Route handlers
├── models/       # Database models
├── routes/       # API routes
├── middleware/   # Custom middleware
├── utils/        # Utility functions
└── scripts/      # Utility scripts

frontend/
├── app/          # Next.js pages
├── components/   # React components
├── lib/          # Utilities and contexts
└── public/       # Static assets
```

## Development Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive message
5. Push and create pull request

## Testing

Currently no automated tests. Planned:
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)

## Contributing

Contributions welcome! Please:
- Follow code style
- Write clear commit messages
- Update documentation
- Test thoroughly

---

[[06-Database-Schema|← Previous: Database Schema]] | [[README|Back to Index]]
