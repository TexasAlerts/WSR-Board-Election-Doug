/**
 * Report generation utilities.
 */

/**
 * Escape CSV formula injection.
 * Prefixes cells starting with formula characters to prevent Excel/Sheets execution.
 */
function escapeCsvFormula(str) {
  if (str && /^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Convert array of objects to CSV string.
 */
export function toCSV(data, columns) {
  if (!data || data.length === 0) return '';

  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  const rows = data.map((row) =>
    cols
      .map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        let str = String(val).replace(/"/g, '""');
        str = escapeCsvFormula(str);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Create a CSV Response.
 */
export function csvResponse(csvString, filename) {
  return new Response(csvString, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
