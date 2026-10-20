# APEX V1 — Backend

Backend scaffold for APEX, an AI-powered student problem-solving application.

## Stack
- Node.js
- Express
- MongoDB with Mongoose
- External AI provider accessed securely through the backend

## Responsibilities
- Authentication and authorization
- Problem submission and retrieval
- AI-powered clarification questions
- STOP / START / REINFORCE analysis
- Input validation and centralized error handling

## Source structure
- `src/config/` — database and application configuration
- `src/models/` — Mongoose models
- `src/controllers/` — HTTP request handlers
- `src/routes/` — API route definitions
- `src/middleware/` — authentication and error handling
- `src/services/` — application and AI service logic
- `src/validators/` — request validation
- `src/utils/` — reusable utilities
- `tests/` — automated tests

## API prefix
`/api/v1`

## Setup
1. Run `npm install` in this directory.
2. Copy `.env.example` to `.env`.
3. Add your MongoDB connection string and a strong JWT secret.
4. Run `npm run dev`.

Authentication endpoints currently available:
- `POST /api/v1/auth/register` — create an account
- `POST /api/v1/auth/login` — log in
- `GET /api/v1/auth/me` — return the signed-in user (requires `Authorization: Bearer <token>`)
- `GET /health` — API health check

Set `MONGODB_URI` and a long, random `JWT_SECRET` in `.env` before starting. Problem workflow and AI integration are still TODOs and will be implemented next.

Never commit `.env` or real API keys.
