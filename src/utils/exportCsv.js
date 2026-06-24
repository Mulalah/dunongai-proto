// Tiny dependency-free CSV export. Builds a roster spreadsheet and triggers a
// browser download. A UTF-8 BOM is prepended so Excel renders Filipino names
// (ñ, é, …) correctly.
import { STATUS_META } from './insights';

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const slug = (s) =>
  (s || 'klase')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'klase';

function downloadText(text, filename) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRosterCsv(students = [], sectionName = 'Klase') {
  const headers = [
    'Pangalan',
    'Grade',
    'Antas sa Pagbasa',
    'Huling Score (%)',
    'Streak (araw)',
    'Status'
  ];
  const rows = students.map((s) => [
    s.displayName || '',
    s.gradeLevel ?? '',
    s.currentLevel ?? '',
    s.lastScore ?? '',
    s.streakDays ?? 0,
    STATUS_META[s.status]?.label || s.status || ''
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const today = new Date().toISOString().slice(0, 10);
  downloadText(csv, `${slug(sectionName)}-roster-${today}.csv`);
}
