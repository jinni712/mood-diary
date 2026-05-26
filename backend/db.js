const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'moodiary.db');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    emotion TEXT NOT NULL,
    score INTEGER NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

function getAllEntries({ year, month } = {}) {
  if (year && month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return db.prepare("SELECT * FROM entries WHERE date LIKE ? ORDER BY date DESC").all(`${prefix}%`);
  }
  return db.prepare("SELECT * FROM entries ORDER BY date DESC").all();
}

function getEntry(date) {
  return db.prepare("SELECT * FROM entries WHERE date = ?").get(date);
}

function createEntry({ date, emotion, score, content }) {
  const stmt = db.prepare(
    "INSERT INTO entries (date, emotion, score, content) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(date, emotion, score, content ?? null);
  return getEntry(date);
}

function updateEntry(date, { emotion, score, content }) {
  const stmt = db.prepare(
    "UPDATE entries SET emotion = ?, score = ?, content = ?, updated_at = datetime('now', 'localtime') WHERE date = ?"
  );
  stmt.run(emotion, score, content ?? null, date);
  return getEntry(date);
}

function deleteEntry(date) {
  return db.prepare("DELETE FROM entries WHERE date = ?").run(date);
}

function getStats(period = 'month') {
  let dateFilter = '';
  if (period === 'week') {
    dateFilter = "WHERE date >= date('now', '-7 days')";
  } else if (period === 'month') {
    dateFilter = "WHERE date >= date('now', '-30 days')";
  } else if (period === 'year') {
    dateFilter = "WHERE date >= date('now', '-365 days')";
  }

  const distribution = db.prepare(
    `SELECT emotion, COUNT(*) as count FROM entries ${dateFilter} GROUP BY emotion ORDER BY count DESC`
  ).all();

  const trend = db.prepare(
    `SELECT date, score, emotion FROM entries ${dateFilter} ORDER BY date ASC`
  ).all();

  return { distribution, trend };
}

module.exports = { getAllEntries, getEntry, createEntry, updateEntry, deleteEntry, getStats };
