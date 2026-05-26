import { useState } from 'react';
import DiaryForm from './components/DiaryForm';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import './App.css';

const TABS = [
  { id: 'today', label: '오늘 기록', icon: '✏️' },
  { id: 'calendar', label: '달력', icon: '📅' },
  { id: 'stats', label: '통계', icon: '📊' },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(null);

  function handleCalendarSelect(date) {
    setSelectedDate(date);
    setTab('today');
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌈 무드다이어리</h1>
        <p className="app-subtitle">오늘의 감정을 기록해보세요</p>
      </header>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => { setTab(t.id); if (t.id !== 'today') setSelectedDate(null); }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'today' && (
          <DiaryForm
            date={selectedDate ?? today}
            onDateChange={setSelectedDate}
          />
        )}
        {tab === 'calendar' && (
          <CalendarView onSelectDate={handleCalendarSelect} />
        )}
        {tab === 'stats' && <StatsView />}
      </main>
    </div>
  );
}
