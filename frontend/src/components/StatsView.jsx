import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { fetchStats } from '../api';
import { EMOTIONS } from './DiaryForm';
import './StatsView.css';

const PERIODS = [
  { value: 'week', label: '7일' },
  { value: 'month', label: '30일' },
  { value: 'year', label: '1년' },
];

export default function StatsView() {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await fetchStats(period);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="stats-loading">통계를 불러오는 중...</div>;
  if (!stats || stats.distribution.length === 0) {
    return (
      <div className="stats-empty">
        <p>📭</p>
        <p>기록이 없어요. 먼저 감정을 기록해보세요!</p>
      </div>
    );
  }

  const pieData = stats.distribution.map(d => {
    const em = EMOTIONS.find(e => e.key === d.emotion);
    return { name: `${em?.emoji ?? ''} ${em?.label ?? d.emotion}`, value: d.count, color: em?.color ?? '#ccc' };
  });

  const lineData = stats.trend.map(t => ({
    date: t.date.slice(5),
    score: t.score,
    emoji: EMOTIONS.find(e => e.key === t.emotion)?.emoji ?? '',
  }));

  const total = stats.distribution.reduce((s, d) => s + d.count, 0);
  const topEmotion = EMOTIONS.find(e => e.key === stats.distribution[0]?.emotion);

  return (
    <div className="stats-view">
      <div className="period-tabs">
        {PERIODS.map(p => (
          <button
            key={p.value}
            className={`period-btn ${period === p.value ? 'active' : ''}`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="stats-summary-card">
        <div className="summary-item">
          <span className="summary-value">{total}</span>
          <span className="summary-label">총 기록</span>
        </div>
        {topEmotion && (
          <div className="summary-item">
            <span className="summary-value">{topEmotion.emoji}</span>
            <span className="summary-label">가장 많은 감정</span>
          </div>
        )}
        {stats.trend.length > 0 && (
          <div className="summary-item">
            <span className="summary-value">
              {(stats.trend.reduce((s, t) => s + t.score, 0) / stats.trend.length).toFixed(1)}
            </span>
            <span className="summary-label">평균 점수</span>
          </div>
        )}
      </div>

      <div className="chart-card">
        <h3>감정 분포</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v}회`, '기록 수']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {lineData.length > 1 && (
        <div className="chart-card">
          <h3>기분 변화 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, n, props) => [`${v}점 ${props.payload.emoji}`, '기분']}
              />
              <Line type="monotone" dataKey="score" stroke="#e8637a" strokeWidth={2} dot={{ fill: '#e8637a', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
