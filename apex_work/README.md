# APEX

APEX is a JUPEB study dashboard for Mathematics, Physics, Chemistry, and Biology. It helps students track syllabus topics, build study plans, complete assessments, and review personalized academic guidance.

## Project structure

- `client/` — React and Vite web app
- `src/` — Express API and MongoDB models
- `data/syllabus-archive.json` — syllabus archive used by the optional import script
- `scripts/` — syllabus import and credential-scan commands
- `tests/` and `integration/` — automated checks
- `render.yaml` — Render API service configuration
- `vercel.json` — Vercel frontend build and API proxy configuration

## Run locally

Requirements: Node.js 22 or newer, npm, MongoDB, and a Groq API key for AI features.

1. Copy `.env.example` to `.env` and set the values for your local database and AI provider.
2. From this folder, run `npm ci` and then `npm start` to start the API on port 5000.
3. In a second terminal, run `npm ci --prefix client` and `npm run dev --prefix client`.
4. Open the local Vite address shown in the terminal.

The Vite development server proxies `/api` and `/health` to the local API. Keep `.env` files out of Git.

## Deploy to staging

### Render API

Create a Render Blueprint from the project root using `render.yaml`. The service runs `npm ci` and `npm start`, and uses `/ready` as its health check.

Set these variables in Render's environment settings:

- `MONGODB_URI` — dedicated staging MongoDB Atlas connection string
- `JWT_SECRET` — newly generated random secret with at least 32 characters
- `CLIENT_URL` — exact HTTPS origin assigned to the Vercel site
- `GROQ_API_KEY` — staging Groq API key
- `CONTENT_EDITOR_EMAILS` — optional comma-separated editor email allowlist

`NODE_ENV` and `APP_TIME_ZONE` are set by `render.yaml`. Keep secret values in Render's environment settings; never place them in the source or Vercel variables.

### Vercel frontend

Create a Vercel project from the project root. `vercel.json` installs the client dependencies, builds `client/`, publishes `client/dist/`, proxies `/api/v1`, `/health`, and `/ready` to Render, and sends app routes to the frontend entry page.

The proxy currently points to `https://apex-api-anjola.onrender.com`. Confirm that this is the hostname Render assigns. If it differs, update the three destinations in `vercel.json` before deploying Vercel. Then set Render's `CLIENT_URL` to the exact Vercel HTTPS origin and redeploy the API. Leave `VITE_API_URL` unset so the browser uses the same-origin proxy.

Restrict staging access with the access controls available on the selected hosting plans. Configure Atlas network access for the Render service using the narrowest supported rule; do not allow access from every IP address.

## Syllabus import

Review `data/syllabus-archive.json` against the current official syllabus before importing it. To validate without database writes, run `npm run syllabus:dry-run`. To merge it into the database, configure `MONGODB_URI` and run `npm run syllabus:import` intentionally. The import is not part of deployment and does not run automatically.
