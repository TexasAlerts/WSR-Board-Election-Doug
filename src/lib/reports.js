/**
 * Report generation utilities.
 */

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
        const str = String(val).replace(/"/g, '""');
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
