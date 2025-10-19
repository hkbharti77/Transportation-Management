# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project stack and purpose
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (via globals.css with @theme tokens)
- Goal: Transportation Management dashboard with role-based admin, driver, and customer experiences backed by an external API (default: http://127.0.0.1:8000/api/v1)

Environment and setup
- Node.js 18+ (20+ recommended)
- Copy .env.local and set the backend base URL:
  
  ```bash
  # .env.local
  NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
  ```

Common commands
- Install deps
  
  ```bash
  npm install
  # If you encounter peer-dependency issues:
  npm install --legacy-peer-deps
  ```

- Start dev server
  
  ```bash
  npm run dev
  ```

- Build, run production server
  
  ```bash
  npm run build
  npm run start
  ```

- Lint
  
  ```bash
  npm run lint
  ```

- Type-check (no emit)
  
  ```bash
  npx tsc --noEmit
  ```

- Tests
  - The repo contains Jest-style tests under src/services/*.test.ts, but no test runner is configured in package.json yet. To run them:
    
    ```bash
    # one-time setup
    npm i -D jest ts-jest @types/jest jest-environment-jsdom
    npx ts-jest config:init
    
    # run all tests
    npx jest
    
    # run a single test file
    npx jest src/services/routeService.test.ts
    
    # run tests matching a name pattern
    npx jest -t "should fetch trip resources"
    ```

Big-picture architecture
- Routing (App Router)
  - Route groups are used for layout concerns:
    - src/app/(admin): authenticated, application shell (sidebar + header)
    - src/app/(full-width-pages)/(auth): authentication pages and their layout
  - No API routes are defined in Next.js; all data comes from the external backend (NEXT_PUBLIC_API_URL)

- Root providers
  - src/app/layout.tsx wraps the app with ThemeProvider, AuthProvider, SidebarProvider. Client components rely on these contexts.

- Contexts
  - AuthContext (src/context/AuthContext.tsx)
    - Stores JWT in localStorage (access_token)
    - fetchUserProfile() calls GET /auth/me to load the current user
    - login(token) persists token and refreshes profile; logout clears it
  - SidebarContext (src/context/SidebarContext.tsx)
    - Controls expanded/hover/mobile state and submenu expansion; used by the shell
  - ThemeContext (src/context/ThemeContext.tsx)
    - Persists theme in localStorage and toggles the ‘dark’ class on documentElement

- Application shell and auth/role gates
  - src/app/(admin)/layout.tsx
    - Enforces authentication and role-based access via useAuth()
    - Redirects unauthenticated users to /signin
    - Applies nuanced redirects for driver and customer roles
    - Composes AppSidebar, AppHeader, and content area spacing responsive to sidebar state
  - src/layout/AppSidebar.tsx
    - Menu source depends on inferred role from pathname
    - Note: Actual access control is enforced by AdminLayout via AuthContext, while the sidebar uses pathname heuristics. When adding new role-specific pages, update both AdminLayout (guards) and AppSidebar (menus)

- Service layer (all network I/O)
  - Located under src/services/* (userService, orderService, routeService, tripService, vehicleService, fleetService, driverService)
  - Share patterns:
    - Read token from localStorage; include Authorization: Bearer ...
    - Base URL is process.env.NEXT_PUBLIC_API_URL with http://127.0.0.1:8000/api/v1 as default
    - Centralized handleResponse that throws on non-OK and sometimes redirects to /signin on 401/403
    - Strong TypeScript types for requests, entities, and PaginatedResponse<T>
  - Examples:
    - userService.login() performs form-encoded POST to /auth/login, stores token, and is used by SignInForm
    - vehicleService.getVehicleStats() implements a 5-minute in-memory cache

- UI composition
  - Shared UI primitives: src/components/ui/* (table, modal, form inputs, badges, buttons)
  - Domain UIs: src/components/ui-elements/* (user-management, order-management, trip-management, vehicle-management, fleet-management)
  - App shell parts: src/layout/* (AppHeader, AppSidebar, Backdrop)
  - Icons are imported as React components via SVGR; wiring in next.config.ts
  - Tailwind v4 tokens and utilities defined in src/app/globals.css (@theme, @utility)

- Pages and flows (representative)
  - Dashboard: src/app/(admin)/page.tsx renders VehicleStatsSummary and FleetSummary cards
  - Vehicles: src/app/(admin)/(ui-elements)/vehicles/page.tsx
    - Uses vehicleService for CRUD-like actions, with modals for view/edit/assign drivers
    - Pagination and filtering handled client-side with service support
  - Orders: src/app/(admin)/(ui-elements)/orders/page.tsx
    - Uses orderService; guarded so only admin/staff can access
  - Auth: src/app/(full-width-pages)/(auth)/signin/page.tsx uses SignInForm; SignInForm delegates to userService.login then AuthContext.login

Conventions and important notes
- Path aliases: @/* maps to ./src/* (tsconfig.json)
- Authentication token is stored in localStorage; service methods redirect to /signin (or in some files /auth/signin) on 401/403. Prefer /signin to match actual route group
- Tailwind v4: No tailwind.config.js — design tokens and utilities live in globals.css
- Images: next/image is used; SVGR is enabled for .svg (see next.config.ts)

Troubleshooting
- 401/403 or infinite redirects: ensure NEXT_PUBLIC_API_URL points at a running backend and the access_token in localStorage is valid
- Jest tests won’t run: add Jest + ts-jest (see Tests above) or create an npm "test" script after configuring
- Peer dependency install issues: try npm install --legacy-peer-deps as noted in README

Key files
- src/app/layout.tsx — root providers
- src/app/(admin)/layout.tsx — authenticated shell + role-based guards
- src/context/* — Theme, Auth, Sidebar contexts
- src/services/* — all API calls and types
- src/components/* — reusable UI and domain components
- next.config.ts — SVGR and image/perf tweaks
- tsconfig.json — path alias and Next plugin

