export interface WPErrorLog {
  timestamp: Date;
  severity: 'Fatal error' | 'Warning' | 'Notice' | 'Parse error' | 'Unknown';
  message: string;
  file: string;
  line: number;
  raw: string; // Storing the original string for debugging
}

/**
 * Parses a raw WordPress/PHP log string into a WPErrorLog object.
 * @param rawEntry - A single line from a wp-content/debug.log file
 */
export function parseWordPressLog(rawEntry: string): WPErrorLog | null {
  // Regex Breakdown:
  // \[(?<timestamp>.*?)\] -> Captures text inside brackets
  // PHP (?<severity>.*?): -> Captures the error level
  // (?<message>.*?) -> Captures the error description
  // in (?<file>.*?) on line (?<line>\d+) -> Captures file path and line number
  const logPattern = /\[(?<timestamp>.*?)\] PHP (?<severity>.*?): (?<message>.*?) in (?<file>.*?) on line (?<line>\d+)/;

  const match = rawEntry.match(logPattern);

  if (!match || !match.groups) {
    return null; // Return null if the line doesn't match standard PHP format
  }

  const { timestamp, severity, message, file, line } = match.groups;

  return {
    timestamp: new Date(timestamp),
    severity: (severity as WPErrorLog['severity']) || 'Unknown',
    message: message.trim(),
    file: file.trim(),
    line: parseInt(line, 10),
    raw: rawEntry
  };
}

// Example usage:
const raw = "[12-Mar-2025 15:42:13 UTC] PHP Fatal error: Call to undefined function get_header() in /themes/mytheme/index.php on line 10";
const parsed = parseWordPressLog(raw);
console.log(parsed);
