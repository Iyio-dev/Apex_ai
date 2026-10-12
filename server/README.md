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

The scaffold files are placeholders; application logic will be added and tested incrementally.
Never commit `.env` or real API keys.
