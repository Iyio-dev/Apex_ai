# APEX landing page and launch notes

## Implemented
- Public landing page at `/` for visitors and `/welcome` for everyone.
- Existing authenticated dashboard remains at `/` for signed-in users.
- Simple hero, illustrative workspace preview, interactive four-step walkthrough, sign-up/login links, light/dark/system theme control, responsive layout.
- Existing `/login` and `/register` forms are reused.

## Local launch
1. Configure backend environment from root `.env.example` and frontend from `client/.env.example`.
2. Install root dependencies and frontend dependencies (`npm install` in root and `client`).
3. Follow the root README for database initialization and backend startup.
4. In `client`, run `npm run dev`; for production, run `npm run build`.
5. Confirm auth/session flow, mobile layout, backend health, HTTPS, secrets and production environment variables before public launch.

## Honest limitations
- Walkthrough is an interactive guided preview, not a live sandbox or video recording.
- No hosting or public deployment has been performed.
- Production backend, database, auth and deployment need independent verification.
