import { useState, useEffect } from 'react';
import { fetchEntry, saveEntry, deleteEntry } from '../firestore';
import './DiaryForm.css';

export const EMOTIONS = [
  { key: 'happy', emoji: '😊', label: '행복', color: '#FFD93D' },
  { key: 'excited', emoji: '🤩', label: '신남', color: '#FF6B6B' },
  { key: 'neutral', emoji: '😐', label: '보통', color: '#95E1D3' },
  { key: 'tired', emoji: '😴', label: '피곤', color: '#A8D8EA' },
  { key: 'anxious', emoji: '😰', label: '불안', color: '#F4A261' },
  { key: 'sad', emoji: '😢', label: '슬픔', color: '#7EC8E3' },
  { key: 'angry', emoji: '😠', label: '화남', color: '#E8637A' },
];

const SCORE_LABELS = ['', '매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];

export default function DiaryForm({ userId, date, onDateChange }) {
  const [emotion, setEmotion] = useState(null);
  const [score, setScore] = useState(3);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setSaved(false);
    setMsg('');
    loadEntry();
  }, [date, userId]);

  async function loadEntry() {
    setLoading(true);
    try {
      const entry = await fetchEntry(userId, date);
      if (entry) {
        setExisting(entry);
        setEmotion(entry.emotion);
        setScore(entry.score);
        setContent(entry.content ?? '');
        setSaved(true);
      } else {
        setExisting(null);
        setEmotion(null);
        setScore(3);
        setContent('');
        setSaved(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!emotion) { setMsg('감정을 선택해주세요!'); return; }
    setLoading(true);
    try {
      await saveEntry(userId, { date, emotion, score, content });
      setSaved(true);
      setMsg('저장되었습니다 ✓');
      setTimeout(() => setMsg(''), 2000);
      await loadEntry();
    } catch (e) {
      setMsg('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm('이 기록을 삭제할까요?')) return;
    setLoading(true);
    try {
      await deleteEntry(userId, date);
      setExisting(null);
      setEmotion(null);
      setScore(3);
      setContent('');
      setSaved(false);
      setMsg('삭제되었습니다.');
      setTimeout(() => setMsg(''), 2000);
    } finally {
      setLoading(false);
    }
  }

  const selectedEmotion = EMOTIONS.find(e => e.key === emotion);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="diary-form">
      <div className="date-row">
        <input
          type="date"
          value={date}
          max={today}
          onChange={e => onDateChange(e.target.value)}
          className="date-input"
        />
        {saved && <span className="saved-badge">기록됨</span>}
      </div>

      <section className="emotion-section">
        <h2>오늘의 감정은?</h2>
        <div className="emotion-grid">
          {EMOTIONS.map(e => (
            <button
              key={e.key}
              className={`emotion-btn ${emotion === e.key ? 'selected' : ''}`}
              style={emotion === e.key ? { borderColor: e.color, background: e.color + '33' } : {}}
              onClick={() => setEmotion(e.key)}
            >
              <span className="emotion-emoji">{e.emoji}</span>
              <span className="emotion-label">{e.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="score-section">
        <h2>기분 강도 <span className="score-badge">{SCORE_LABELS[score]}</span></h2>
        <div className="score-track">
          <input
            type="range"
            min={1}
            max={5}
            value={score}
            onChange={e => setScore(Number(e.target.value))}
            className="score-slider"
            style={selectedEmotion ? { accentColor: selectedEmotion.color } : {}}
          />
          <div className="score-dots">
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} className={`score-dot ${score >= n ? 'filled' : ''}`}
                style={score >= n && selectedEmotion ? { background: selectedEmotion.color } : {}} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>오늘 하루는 어땠나요?</h2>
        <textarea
          className="diary-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="자유롭게 오늘의 이야기를 적어보세요..."
          rows={5}
        />
      </section>

      {msg && <p className="form-msg">{msg}</p>}

      <div className="form-actions">
        <button className="save-btn" onClick={handleSave} disabled={loading}>
          {loading ? '저장 중...' : saved ? '수정하기' : '저장하기'}
        </button>
        {existing && (
          <button className="delete-btn" onClick={handleDelete} disabled={loading}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
