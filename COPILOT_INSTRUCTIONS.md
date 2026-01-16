# Project Setup Prompt

Use the following prompt to recreate the React web app with best practices:

---

**React Web App Setup Steps**

1. Create the following folders inside `src/`:
   - `components/` (reusable UI components)
   - `layouts/` (layout components)
   - `pages/` (page-level components)
   - `forms/` (form-related components)
   - `utils/` (helper functions)
   - `api/` (centralized API modules, constants, and client)
2. Use only `.js` files for all React components, pages, and layouts. Do not use `.tsx` or TypeScript for UI.
3. Use functional React components and hooks. Add JSDoc comments for documentation.
4. Create `BaseLayout.js` with a sticky top nav bar and a conditional side nav bar (visible only when logged in).
5. Use Material UI for navigation, buttons, icons, and layout components.
6. Set up routing in `App.js` using React Router for `/` (LandingPage) and `/home` (HomePage).
7. Use CSS Modules, styled-components, or Material UI's styling system for styles. Avoid global CSS unless necessary.
8. Use Framer Motion for animations if needed.
9. Use React hooks for state. For persistent storage, use `localStorage` or `sessionStorage` via utility functions in `utils/`.
10. Keep all code modular, reusable, and DRY. Avoid duplication.
11. All components, layouts, and utilities must have JSDoc comments.
12. Example entry files:
    - `src/index.js`:
      ```jsx
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from './App';
      import { CssBaseline } from '@mui/material';
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <React.StrictMode>
          <CssBaseline />
          <App />
        </React.StrictMode>
      );
      ```
    - `src/App.js`:
      ```jsx
      import React from 'react';
      import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
      import LandingPage from './pages/LandingPage';
      import HomePage from './pages/HomePage';
      export default function App() {
        return (
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
            </Routes>
          </Router>
        );
      }
      ```

---

# Next Instructions

After initial setup, automatically proceed with these next steps:

1. Add sample components in `components/` (e.g., `Button.js`, `Card.js`).
2. Add a sample form in `forms/` (e.g., `LoginForm.js`).
3. Add utility functions in `utils/` (e.g., `storage.js` for localStorage/sessionStorage helpers).
4. Add JSDoc comments to all new files and functions.
5. Add a README.md in the root with setup and usage instructions.
6. Test the app by running `npm start` and verify all routes and layouts work as expected.
7. Refactor and modularize code as needed for maintainability.

---

# Task Circuit Copilot Instructions (December 2025)

## Documentation Update Policy
- Whenever you update endpoints, authentication logic, or API usage, always update both COPILOT_INSTRUCTIONS.md and API_DOC.md together.
- API_DOC.md contains endpoint references, curl examples, and expected responses.
- COPILOT_INSTRUCTIONS.md contains implementation details, project structure, and best practices.
- Keep both files in sync for robust development and maintenance.

## Project Structure & Setup
- React web app using Material UI for all UI components and layouts.
- Code organized into:
  - `src/layouts/` (BaseLayout.js, UserLayout.js)
  - `src/pages/` (LandingPage.js, HomePage.js, LoginPage.js)
  - `src/pages/user/` (DashboardPage.js, other user pages)
  - `src/utils/` (auth, helpers, resources utilities)
  - `src/api/` (centralized API modules - auth.js, user.js, task.js, pond.js, fish.js, sampling.js, company.js, client.js, constants.js)
  - `src/config.js` (BASE_URL)

## API Module Structure
- All API calls are centralized in `src/api/` folder.
- Each domain has its own module: `auth.js`, `user.js`, `task.js`, `pond.js`, `fish.js`, `sampling.js`, `company.js`.
- API constants (endpoint paths) are in `src/api/constants.js`.
- API client utilities (`apiFetch`, `ApiError`, etc.) are in `src/api/client.js`.
- Import API functions from `src/api/` (e.g., `import { login, signup } from '../api'`).
- Use the domain-specific API functions instead of raw `apiFetch` calls with endpoints.

## Authentication & Session Management
- On login, use `processLoginResponse` to store access_token, refresh_token, expiry, and user info in localStorage.
- Access token expiry is extracted from the JWT and used for accurate scheduling.
- Token refresh and validation are handled by robust schedulers in `storage.js`.
- Session is valid if access_token, refresh_token, and user info are present in localStorage.
- UserLayout checks for all three before allowing access to user pages.
- On logout, clear all tokens, user info, and tasks from localStorage.

## Token Refresh & Validation
- Token refresh is scheduled 2 minutes before expiry, or every 30 minutes if expiry is missing.
- Scheduler uses expiry from the validator API if available, and reschedules accordingly.
- No duplicate or excessive requests; only one timer is active at a time.
- Use `validateAccessToken` and `refreshAccessToken` utilities for robust management.

## Task Management
- Tasks are cached in localStorage and reused if fetched within the last 5 minutes.
- On DashboardPage mount, tasks are loaded from localStorage if recent, otherwise fetched from API and saved.
- All task updates (mark as done, unread, etc.) use the `updateTask` function, which syncs changes with both API and localStorage.
- Utility functions: `saveTasksToLocalStorage`, `loadTasksFromLocalStorage`, `clearTasksFromLocalStorage`, `getTasksLastFetched`.

## Layouts & Navigation
- Public pages (landing, home, login) use BaseLayout (no sidebar).
- User pages under `/taskcircuit/user/*` use UserLayout, which wraps BaseLayout and enables the sidebar.
- Sidebar is only visible for user pages after login and supports collapse/expand.
- Top nav bar is always visible, sticky, and shows project name and user actions.

## Best Practices
- Always use API functions from `src/api/` for API calls (e.g., `import { login } from '../api'`).
- Use token/session utilities from `src/utils/auth/` for authentication and session management.
- Use localStorage for caching tasks and user info, and keep data in sync with API.
- All code is modular, documented, and extensible for future features.
- Remove unused imports and variables to keep code clean.

## Extensibility
- To add new API endpoints, update `src/api/constants.js` and create/update the corresponding API module in `src/api/`.
- To add new user pages, create a new component in `src/pages/user/` and add a route in App.js.
- To add new sidebar items, update the navItems array in BaseLayout.js.
- To extend task logic, use and adapt the utilities and updateTask pattern in DashboardPage.js.

---

# Task Circuit Project Instructions (as of 2025-12-05)

## Layout & Navigation
- The project uses a unified BaseLayout for all pages, with a fixed top navigation bar and a sticky, collapsible sidebar for user pages.
- The sidebar contains navigation buttons for Dashboard, Tasks, and Pool, each with icons and active/hover states.
- The main content container is flush with the sidebar, scrollable, and loads all page content. Only this container updates on route changes.
- All buttons use modern color schemes, shadows, and spacing for best UI and accessibility.

## Routing & Page Structure
- Routing is managed in `App.js` using React Router.
- All `/taskcircuit/user/*` pages are wrapped by `UserLayout`, which enforces authentication and sidebar visibility.
- Individual user pages (DashboardPage, TasksPage, ChatPage, PondPage, ReportsPage, InvoicePage, SalesTaxPage, DatasetPage, ManageUsersPage) are loaded in the main container.
- Sidebar navigation is controlled by the `navItems` array in BaseLayout.js. To add new pages, update `navItems` and add a route in App.js.

## Authentication
- Sidebar and user pages are only visible to logged-in users (checked via access token, refresh token, and user info in local storage).
- If not logged in, users are redirected to the login page.
- Logout clears tokens and user info from local storage and redirects to login.

## Page Content
- Dashboard, Tasks, and Pool pages are implemented and visible in the main container when their sidebar buttons are clicked.
- Each page uses a consistent container style (`<Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>`).
- TasksPage and PoolPage export only their content; layout is handled by the router.

## Best Practices
- Never wrap user pages with `UserLayout` inside their own files—only use the router for layout.
- Always check for authentication before rendering user pages.
- Use debug logs for API calls and state changes to aid troubleshooting.
- Keep instructions and API docs up to date as the project evolves.

---

# Task Circuit Sidebar & Layout Instructions (as of December 5, 2025)

## Sidebar Button Order
The sidebar navigation is arranged in the following order:
1. Dashboard
2. Tasks
3. Chat
4. Pond
5. Reports
6. Invoice
7. Sales Tax
8. Dataset
9. Manage Users

## Sidebar Design
- Sidebar navigation uses Material UI ListItemButton for each nav item.
- Button background color uses theme's secondary color (`secondary.main`) for a modern look.
- Button text color is set to `grey.400` for improved readability and a lighter, cool appearance.
- On hover, background changes to `primary.light` and text color to `primary.dark`.
- On active, background is `primary.light` and text color is `primary.dark`.
- All sidebar buttons have shadow and spacing for a floating, accessible UI.
- Sidebar supports collapse/expand with smooth transitions.
- Each button uses a relevant Material UI icon (Dashboard, Assignment, Chat, Pool, Analytics, Receipt, LocalAtm, Storage, AccountCircle).

## Layout
- Top navigation bar is fixed and sticky, always visible.
- Sidebar is sticky and only visible for user pages after login.
- Main content container is flush with sidebar, scrollable, and loads all page content.
- All navigation and layout are robust, consistent, and visually appealing.

## Routing & Page Structure
- Routing is managed in `App.js` using React Router.
- All `/taskcircuit/user/*` pages are wrapped by `UserLayout`, which enforces authentication and sidebar visibility.
- Individual user pages (DashboardPage, TasksPage, ChatPage, PondPage, ReportsPage, InvoicePage, SalesTaxPage, DatasetPage, ManageUsersPage) are loaded in the main container.
- Sidebar navigation is controlled by the `navItems` array in BaseLayout.js. To add new pages, update `navItems` and add a route in App.js.

## Best Practices
- Use theme colors for all UI elements for consistency and accessibility.
- Keep sidebar and layout instructions up to date in COPILOT_INSTRUCTIONS.md for future development.
- Test all UI changes for readability, accessibility, and responsiveness.
- Remove unused imports and variables to keep code clean.

---

# Task Circuit Project Copilot Instructions

## General Layout & Design
- Use BaseLayout for all pages, with sticky top and side nav bars.
- Side nav bar is hidden unless user is logged in (refresh_token in storage).
- Top nav bar shows profile, logout, and settings when logged in; login/signup/register otherwise.
- All navigation and endpoints use baseUrl and endpoint lists from config files.
- All containers and cards use smooth scrolling, full width, and modern spacing.
- Use MUI icons and components for best UI/UX.

## Fish Data Management
- FishPage lists all fish with cards: fish name, ID, image/icon, scientific name (gray), total count, next date, and ponds list.
- Entire fish card is clickable to open Fish view dialog.
- Add Fish Data button (right) opens FishForm for new entry; search (left) filters by name.
- FishForm supports all biological, catch, and custom fields, with dropdowns and addable custom fields.
- Fish view shows all data line by line, with clear sections, full width, smooth scrolling, and fish ID.
- All new fish get a unique ID on creation.

## Forms & Components
- All forms (signup, register company, update password, update mobile/email, add user, add pond, add fish) use MUI Paper, TextField, Button, and proper validation.
- Use dialog/modal for form entry and editing.
- All forms and cards use icons, modern spacing, and robust error handling.

## API & Storage
- Always use access_token for authentication; refresh every 30min via scheduler.
- Validate token via /auth/validate endpoint; refresh via /auth/token.
- Store user info and tasks in localStorage; always check storage first before API call.
- All endpoints and baseUrl are taken from config files.
- Log API calls and token refreshes for debugging.
- On 401, validate/refresh token or force login.

## Fish API Example
- Add fish: POST /fish (fields: all biological, catch, custom)
- Get fish: GET /fish/:id
- List fish: GET /fish
- Update fish: PUT /fish/:id
- Delete fish: DELETE /fish/:id

## UI/UX Conventions
- Use full width for main containers and cards.
- Use Stack for vertical/horizontal alignment.
- Use icons for buttons and card visuals.
- Use gray for secondary text, color for highlights.
- All cards and forms are visually grouped, floating, and modern.
- All navigation and actions are robust and accessible.

## Next Steps
- For new components/forms, follow above conventions.
- Document all new endpoints and UI features in this file and API docs.
- Keep instructions and docs updated as features evolve.
