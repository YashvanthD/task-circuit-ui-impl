# React Web App Setup

## Setup Instructions

1. Install dependencies:
   ```sh
   npm install @mui/material @emotion/react @emotion/styled react-router-dom framer-motion
   ```
2. Start the development server:
   ```sh
   npm start
   ```

## Project Structure

- `src/components/` — Reusable UI components
- `src/layouts/` — Layout components (BaseLayout, etc.)
- `src/pages/` — Page-level components (LandingPage, HomePage)
- `src/forms/` — Form-related components (LoginForm)
- `src/utils/` — Helper functions (storage.js)
- `src/endpoints/` — API endpoint definitions

## Usage
- Visit `/` for the landing page
- Visit `/home` for the home page

## Styling
- Uses Material UI for UI components and layout
- Framer Motion for animations (if needed)

## Notes
- All components use functional React and hooks
- JSDoc comments are included for documentation
- Persistent storage via localStorage/sessionStorage helpers in `utils/storage.js`

---

For more details, see COPILOT_INSTRUCTIONS.md

