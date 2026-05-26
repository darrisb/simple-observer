# dash-board Application Documentation

## Overview
`dash-board` is an Angular 21 standalone frontend focused on WordPress plugin observability.
It renders a compact calendar-first error widget and a date-level details modal for daily error review.

Primary goals:
- fit inside a WordPress widget/container width
- visualize daily error presence quickly (green vs red days)
- provide date-specific drilldown in a PrimeNG modal
- support fast local development with a mock API toggle

## Architecture Summary
- Framework: Angular standalone API (`bootstrapApplication`, route-level standalone components)
- UI layer: PrimeNG (`DatePicker`, `Dialog`) plus custom SCSS
- Data access: `ApiService` over `HttpClient`
- Auth: WordPress nonce/session validation via `admin-ajax.php` endpoint checks
- Route protection: `authGuard` gate for `/dashboard` (bypassed in mock mode)
- Runtime toggle: `environment.useMockApi` switches live API vs in-app mocks

## Directory Structure
```text
dash-board/
  angular.json
  package.json
  APPLICATION.md
  src/
    main.ts
    index.html
    styles.scss
    environments/
      environment.ts
    app/
      app.ts
      app.html
      app.scss
      app.config.ts
      app.routes.ts
      mocks/
        mock-api.ts
      components/
        dashboard-wrapper/
        log-viewing/
        report-analysis/
        register/
        fix-suggestions/
        interface/
      services/
        api.service.ts
        report-analysis.ts
        register.service.ts
        authInterceptor.ts
        auth.guard.ts
```

## Component Descriptions
### Root and Routing
- `App`: route host with `<router-outlet>`.
- `app.routes.ts`:
  - `/dashboard` -> dashboard widget view (guarded)
  - `/upgrade` -> pro plan information page
  - `/` redirects to `/dashboard`

### Dashboard Widget Flow
- `DashboardWrapper`:
  - fetches log payload via `ReportAnalysisService.getReportAnalysisFromApi()`
  - passes `errors` into `LogViewing`
- `LogViewing` (current primary UX):
  - inline PrimeNG calendar
  - day coloring based on error presence
    - green: no errors on date
    - red: one or more errors on date
  - click date -> opens `p-dialog`
  - modal shows grouped issues, counts, latest time, and AI-fix availability

### Legacy/Secondary Components
- `ReportAnalysis`: previous large analysis panel (still present in codebase but not active in widget path).
- `FixSuggestions`: placeholder action surface.
- `Register`: registration + WordPress token sync flow.

## Shared Services
- `ApiService`:
  - central HTTP abstraction for `get/post/put/delete`
  - mock router when `environment.useMockApi === true`
  - live API passthrough when toggle is `false`
- `ReportAnalysisService`:
  - dashboard log query (`api/dashboard/query`)
  - error explanation (`api/dashboard/explain/:id`)
  - optional WordPress AJAX sync helpers
- `RegisterService`:
  - registration endpoint + WordPress post wrapper
- `authInterceptor`:
  - pass-through in base edition (no API-key header requirement)
- `auth.guard`:
  - allows dashboard route with API key
  - injects mock key automatically when mock mode is enabled

## Data Flow Explanation
### Dashboard data
1. `/dashboard` route loads `DashboardWrapper`.
2. Wrapper requests `GET api/dashboard/query`.
3. `ApiService` resolves response from:
   - `src/app/mocks/mock-api.ts` when `useMockApi: true`
   - backend at `environment.apiUrl` when `useMockApi: false`
4. `LogViewing` receives raw errors and builds date-keyed maps.
5. Date cells render visual status immediately.
6. Date click opens modal with grouped issue details for that date.

### Access and session behavior (live mode)
1. WordPress admin session must be authenticated.
2. Angular calls `admin-ajax.php` with nonce for `ai_get_logs`.
3. WordPress validates session + nonce and returns DB-backed logs.

## Setup Instructions
## Requirements
- Node.js + npm
- Angular CLI compatible with Angular 21
- Optional backend API at `http://localhost:3000` for live mode

## Install
```bash
npm install
```

## Run (development)
```bash
npm run start
```
Open `http://localhost:4200`.

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Configuration
- `src/environments/environment.ts`
  - `apiUrl`: backend base URL
  - `useMockApi`: local mock toggle
    - `true` => run without backend
    - `false` => call real backend

## Execution Flow
1. `main.ts` bootstraps app with router + HttpClient interceptor + PrimeNG theme provider.
2. Route guard checks key access (or auto-allows mock mode).
3. Dashboard fetches logs.
4. Calendar paints day health colors.
5. User clicks day to inspect grouped events in modal.

## How dash-board Links to rag-ui
`dash-board` and `rag-ui` are separate Angular apps but are designed to sit on the same platform stack.

They link in these ways:
- Shared backend host:
  - both default to `http://localhost:3000` through each app's `environment.apiUrl`
- Shared identity patterns:
  - `dash-board` base edition uses WordPress session + nonce checks
  - `rag-ui` uses bearer auth (`Authorization: Bearer ...`)
- Shared WordPress plugin context:
  - both are suitable to be embedded or launched from WordPress-admin/plugin experiences
  - both can run with local mock data for frontend-first iteration
- Shared operational lifecycle:
  - `rag-ui` handles ingestion/configuration of RAG/bot behavior
  - `dash-board` surfaces operational log outcomes and daily health visibility for support/admin users

In short: `rag-ui` is build/config + content ingestion, while `dash-board` is ops monitoring and issue triage.

## WordPress Plugin Integration (Current)
- In WordPress mode, `dash-board` reads `window.AI_CONFIG` injected by the plugin template.
- Log fetch now uses `admin-ajax.php` action `ai_get_logs` (from `AI_CONFIG.actions.getLogs`) instead of the old `api/dashboard/query` route.
- Request shape:
  - `action=ai_get_logs`
  - `nonce=<AI_CONFIG.nonce>`
  - `log_type=errors`
  - `limit=<number>`
- Response shape expected from plugin:
  - `success: true`
  - `data.errors: []`
- Route guard behavior:
  - mock mode still bypasses auth
  - WordPress mode allows entry based on `AI_CONFIG.apiUrl + nonce`
  - legacy standalone mode still supports API-key gating

## Current Notes
- `LogViewingService` filename/import path has an extra dot (`log-viewing.service..ts` / `log-viewing.service.`); app still compiles due current usage but this should be normalized.
- Some legacy components remain in the repo and can be removed later if widget-only scope is final.
- Build currently reports bundle-budget warnings; functional build still succeeds.
