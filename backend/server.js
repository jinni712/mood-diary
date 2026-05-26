const express = require('express');
const cors = require('cors');
const { getAllEntries, getEntry, createEntry, updateEntry, deleteEntry, getStats } = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/entries', (req, res) => {
  try {
    const { year, month } = req.query;
    const entries = getAllEntries({ year, month });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/entries/:date', (req, res) => {
  try {
    const entry = getEntry(req.params.date);
    if (!entry) return res.status(404).json({ error: '기록이 없습니다.' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/entries', (req, res) => {
  try {
    const { date, emotion, score, content } = req.body;
    if (!date || !emotion || score == null) {
      return res.status(400).json({ error: 'date, emotion, score는 필수입니다.' });
    }
    const existing = getEntry(date);
    if (existing) {
      const updated = updateEntry(date, { emotion, score, content });
      return res.json(updated);
    }
    const entry = createEntry({ date, emotion, score, content });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/entries/:date', (req, res) => {
  try {
    const { emotion, score, content } = req.body;
    const existing = getEntry(req.params.date);
    if (!existing) return res.status(404).json({ error: '기록이 없습니다.' });
    const entry = updateEntry(req.params.date, { emotion, score, content });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/entries/:date', (req, res) => {
  try {
    const existing = getEntry(req.params.date);
    if (!existing) return res.status(404).json({ error: '기록이 없습니다.' });
    deleteEntry(req.params.date);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const { period } = req.query;
    res.json(getStats(period));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Moodiary 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
