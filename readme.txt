=== My Observer Runtime Error Monitor ===
Contributors: myobserver
Tags: error, error monitor
Requires at least: 6.3
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 3.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress runtime incident triage plugin with a dashboard heatmap, grouped error patterns, and AJAX log retrieval for fast debugging.

== Description ==

MyObserver Runtime Error Monitor records WordPress and PHP runtime errors, groups recurring failures, and surfaces them in an inline dashboard heatmap widget for day-by-day triage.

Distinct focus:
- Heatmap-based daily triage instead of a flat log stream.
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

== Screenshots ==
1. Dashboard Heatmap
2. Error Search Table
3. Advanced Dashboard to view chat history and configure and test the vector database.


== Installation ==

1. Upload plugin files to `/wp-content/plugins/myobserver-runtime-error-monitor/` or install from the plugin screen.
2. Activate the plugin through the Plugins screen in WordPress.
3. Overview

== Changelog ==

= 3.0.2 =
* Replaced calendar date widget with a dashboard heatmap view for daily runtime-error intensity scanning.
* Reworked runtime error list into grouped issue cards using PrimeNG DataView grid layout.
* Grouped repeated errors by pattern and surfaced occurrence counts with in-card scrollable timelines.
* Upgraded runtime filter toolbar controls to PrimeNG components (select, datepicker, input, and buttons).
* Refreshed error detail modal styling to align with dashboard theme and hardened modal width handling for WordPress admin CSS overrides.

= 3.0.1 =
* Initial release with runtime error capture and dashboard widget.
