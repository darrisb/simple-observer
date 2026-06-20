=== MyObserver Runtime Error Monitor ===
Contributors: myobserver
Tags: observability, logging, errors, monitoring, dashboard
Requires at least: 6.3
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 3.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress runtime incident triage plugin with a dashboard calendar, grouped error patterns, and AJAX log retrieval for fast debugging.

== Description ==

MyObserver Runtime Error Monitor records WordPress and PHP runtime errors, groups recurring failures, and surfaces them in an inline dashboard calendar widget for day-by-day triage.

Privacy and data use:
- Free mode stores logs in WordPress database tables.
- Free mode does not require an external logging bridge.

Distinct focus:
- Calendar-based daily triage instead of a flat log stream.
- Grouped recurring errors to reduce alert noise and speed investigation.
- Built for WordPress admin workflows (dashboard-first visibility for site operators).

Bundled build artifacts:
- This plugin ships compiled Angular assets in `templates/angular-app/`.
- Source repository (required for WordPress.org readability compliance): https://github.com/darrisb/simple-observer
- Build command example: `npm ci && npm run build`

== External services ==

This plugin connects to the MyObserver API service to power dashboard and premium-related API features in the bundled Angular app.

Service domain:
- https://api.myobserver.io

What the service is used for:
- Retrieving premium availability/status and related dashboard content.
- Sending client-side error telemetry from the dashboard app.

What data is sent and when:
- No data is sent in the get request. The request is to check and see if the pro version was released. It returns {availability: false | true} true will let the user know pro is available to download if intersted.
- When client-side dashboard errors happen, the app may send error details such as message, stack trace (if available), page URL, browser user agent, and timestamp.This is to make improvements later with releases.

Service policies:
- Privacy Policy: https://myobserver.io/privacy

== Installation ==

1. Upload plugin files to `/wp-content/plugins/myobserver-runtime-error-monitor/` or install from the plugin screen.
2. Activate the plugin through the Plugins screen in WordPress.
3. Open WordPress Dashboard to view the widget.

== Changelog ==

= 3.0.1 =
* Initial release with runtime error capture and dashboard widget.
