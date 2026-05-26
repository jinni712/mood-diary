const BASE = '/api';

export async function fetchEntries({ year, month } = {}) {
  const params = new URLSearchParams();
  if (year) params.set('year', year);
  if (month) params.set('month', month);
  const res = await fetch(`${BASE}/entries?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchEntry(date) {
  const res = await fetch(`${BASE}/entries/${date}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveEntry({ date, emotion, score, content }) {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, emotion, score, content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteEntry(date) {
  const res = await fetch(`${BASE}/entries/${date}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchStats(period = 'month') {
  const res = await fetch(`${BASE}/stats?period=${period}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
