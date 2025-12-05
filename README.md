# TaskCircuit Web App

## Features
- Modern dashboard with sticky top/side nav bars
- User authentication, profile, and settings
- Fish data management: list, view, add, edit, search
- Robust forms for signup, company registration, password/mobile/email update, add user, add pond, add fish
- All forms use MUI components, icons, and validation
- Smooth scrolling, full width, and modern design

## Fish Data
- FishPage: lists all fish with cards (name, ID, image/icon, scientific name, count, next date, ponds)
- FishForm: add/edit fish with all biological, catch, and custom fields
- Fish view: line-by-line display, full width, smooth scroll, fish ID
- Add/search fish with top bar buttons

## Authentication & Storage
- Uses access_token for all API calls; refreshes every 30min
- User info and tasks stored in localStorage; always check storage first
- Endpoints and baseUrl from config files
- Handles 401 errors with token refresh or force login

## API Endpoints
- Add fish: POST /fish
- Get fish: GET /fish/:id
- List fish: GET /fish
- Update fish: PUT /fish/:id
- Delete fish: DELETE /fish/:id

## UI/UX
- Full width, grouped cards, floating design
- Icons for buttons and visuals
- Gray for secondary text, color for highlights
- All navigation/actions robust and accessible

## Development
- Follow conventions in COPILOT_INSTRUCTIONS.md
- Update docs and instructions as features evolve

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
