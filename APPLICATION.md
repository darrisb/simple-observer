# dash-board Application Documentation

## Overview
`dash-board` is an Angular dashboard embedded in WordPress admin. It gives a calendar-based view of daily error health and a per-day drilldown modal for issue review.

## What the UI Does
The UI is built around one primary workflow:

1. Load error logs for the current site.
2. Paint calendar days:
   - green day = no errors
   - red day = one or more errors
3. Open a date to view grouped issues:
   - error message
   - file path
   - event count
   - latest time seen
   - whether an AI explanation flag exists on that record

Main pieces:
- `DashboardWrapper`: fetches logs and passes them down.
- `LogViewing`: renders the calendar + details dialog.

## What the WordPress Plugin Does
The plugin side is responsible for data collection and secure delivery to the UI:

- Captures/stores error events in WordPress data storage.
- Injects runtime config into the page (`window.MYOBRM_CONFIG` or legacy `window.AI_CONFIG`), including AJAX URL and nonce.
- Exposes a WordPress AJAX action used by the dashboard to read logs.

Current dashboard log request payload:
- `action=myobrm_get_logs`
- `nonce=<wp nonce>`
- `log_type=errors`
- `limit=500`

Expected response format:
- `success: true`
- `data.errors: []`

## What Data Goes to https://api.myobserver.io
The app default API host is `https://api.myobserver.io` (`src/environments/environment.ts`), but the main log read path uses WordPress AJAX, not this host.

Data sent to `https://api.myobserver.io` in current code:

1. `GET /api/pro/availability`
- Trigger: on `LogViewing` init.
- Purpose: check whether to show the upgrade badge.
- Payload: no request body.

2. `POST /api/client-errors`
- Trigger: automatic client error logger in `main.ts`.
- Purpose: send front-end runtime errors.
- JSON fields sent:
  - `source` (`window.error`, `unhandledrejection`, or `console.error`)
  - `message`
  - `stack` (if available)
  - `pageUrl`
  - `userAgent`
  - `timestamp`
  - `line` and `column` (for window errors, if available)
  - `extra` (for unhandled promise rejections, if available)

### Important Clarification
- Error logs displayed in the calendar are requested from WordPress (`admin-ajax.php`) using nonce-protected AJAX.
- Those calendar log records are not posted by this UI to `https://api.myobserver.io`.

## Development Toggle
- `useMockApi: true` -> serve mock responses from `src/app/mocks/mock-api.ts`
- `useMockApi: false` -> use live HTTP behavior
