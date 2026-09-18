export function duplicateGroups(rows) {
 const map = new Map();
 for (const row of rows) {
  if (row.error || !row.sha256) continue;
  const key = `${row.bytes}:${row.sha256}`;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(row);
 }
 return [...map.values()].filter(group => group.length > 1);
}
export function manifest(rows) {
 return {schema: 'savepinner-local-file-manifest-v1', generated_at: new Date().toISOString(), files: rows, exact_duplicate_candidates: duplicateGroups(rows).map(group => group.map(row => row.id))};
}
