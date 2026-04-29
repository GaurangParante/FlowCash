export const buildCSV = (rows) => {
  const header = ['id','amount','date','note','category'];
  const csv = [header.join(',')].concat(rows.map(r => [r.id, r.amount, `"${r.date}"`, `"${(r.note||'').replace(/"/g,'""')}"`, `"${(r.category||'').replace(/"/g,'""')}"`].join(','))).join('\n');
  return csv;
};
