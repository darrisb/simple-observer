=== MyObserver Runtime Error Monitor ===
Contributors: myobserver, darrisb
Tags: observability, logging, errors, monitoring, dashboard
Requires at least: 6.3
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 3.0.0
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
- Source repository (required for WordPress.org readability compliance): https://github.com/darrisb/myobserver-runtime-error-monitor.git
- Build command example: `npm ci && npm run build`

== Installation ==

1. Upload plugin files to `/wp-content/plugins/myobserver-runtime-error-monitor/` or install from the plugin screen.
2. Activate the plugin through the Plugins screen in WordPress.
3. Open WordPress Dashboard to view the widget.

== Changelog ==

= 3.0.0 =
* Initial release with runtime error capture and dashboard widget.
