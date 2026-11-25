# APEX loading popup update

- Replaces the startup `Loading APEX…` text with an animated, accessible popup.
- Uses `BrainCircuit`, `Sparkles`, and `LoaderCircle` from the existing `lucide-react` dependency.
- Applies the same loader to the dashboard's data-loading state.
- Supports light/dark themes and reduced-motion settings.
- Reusable: `import { ApexLoader } from "../../components/ui/ApexLoader";` and render `<ApexLoader message="Loading your data" />` for other pages.
- The popup is shown only while actual loading is occurring; no artificial delay.

To validate: `cd client && npm ci && npm run build` then run the frontend and backend. Backend integration and live visual QA have not been verified here.
