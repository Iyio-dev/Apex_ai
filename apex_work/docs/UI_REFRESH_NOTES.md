# APEX UI refresh

Updated global visual styles, responsive sidebar presentation, authentication layout, and appearance controls (light/dark/system). Existing /register flow retained, with password confirmation added client-side. Theme preference is stored in localStorage.

## Verification
Run `cd client && npm ci && npm run build` and test both auth flows against the configured backend. Full integration testing requires a running API and database. Password reset was not implemented because the backend does not expose a reset flow. The visual background is a layered blurred gradient (no external image asset).
