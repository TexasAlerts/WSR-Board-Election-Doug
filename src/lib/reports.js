/**
 * Report generation and CSV export utilities.
 * Provides functions to convert data to CSV format and create downloadable responses.
 *
 * @module reports
 */

/**
 * Convert an array of objects to a CSV-formatted string.
 * Handles proper escaping of commas, quotes, and newlines according to CSV standards.
 * If no columns are specified, uses all keys from the first object.
 *
 * @param {Array<Object>} data - Array of objects to convert to CSV
 * @param {string[]} [columns] - Optional array of column names to include (uses all keys if omitted)
 * @returns {string} CSV-formatted string with header row and data rows
 *
 * @example
 * const data = [
 *   { name: 'John', age: 30 },
 *   { name: 'Jane', age: 25 }
 * ];
 * const csv = toCSV(data);
 * // Returns: "name,age\nJohn,30\nJane,25"
 *
 * @example
 * // Specify columns explicitly
 * const csv = toCSV(data, ['name']);
 * // Returns: "name\nJohn\nJane"
 */
export function toCSV(data, columns) {
  if (!data || data.length === 0) return '';

  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  const rows = data.map(row =>
    cols.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Create an HTTP Response object for downloading a CSV file.
 * Sets appropriate headers for CSV content type and file download.
 *
 * @param {string} csvString - CSV-formatted string content
 * @param {string} filename - Filename for the downloaded file (should include .csv extension)
 * @returns {Response} HTTP Response object with CSV content and download headers
 *
 * @example
 * // In an API route
 * const data = [{ name: 'John', email: 'john@example.com' }];
 * const csv = toCSV(data);
 * return csvResponse(csv, 'supporters.csv');
 */
export function csvResponse(csvString, filename) {
  return new Response(csvString, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
