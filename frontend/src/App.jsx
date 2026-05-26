import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import DiaryForm from './components/DiaryForm';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import AuthPage from './components/AuthPage';
import './App.css';

const TABS = [
  { id: 'today', label: '오늘 기록', icon: '✏️' },
  { id: 'calendar', label: '달력', icon: '📅' },
  { id: 'stats', label: '통계', icon: '📊' },
];

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = 로딩 중
  const [tab, setTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
    });
    return unsubscribe;
  }, []);

  function handleCalendarSelect(date) {
    setSelectedDate(date);
    setTab('today');
  }

  async function handleLogout() {
    await signOut(auth);
    setSelectedDate(null);
    setTab('today');
  }

  const today = new Date().toISOString().slice(0, 10);

  // 로딩 중
  if (user === undefined) {
    return (
      <div className="app-loading">
        <span>🌈</span>
        <p>잠시만요...</p>
      </div>
    );
  }

  // 비로그인
  if (!user) {
    return <AuthPage />;
  }

  // 로그인 완료
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>🌈 무드다이어리</h1>
          <div className="user-info">
            <img src={user.photoURL} alt="프로필" className="user-avatar" />
            <span className="user-name">{user.displayName?.split(' ')[0]}님</span>
            <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
          </div>
        </div>
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
            userId={user.uid}
            date={selectedDate ?? today}
            onDateChange={setSelectedDate}
          />
        )}
        {tab === 'calendar' && (
          <CalendarView userId={user.uid} onSelectDate={handleCalendarSelect} />
        )}
        {tab === 'stats' && <StatsView userId={user.uid} />}
      </main>
    </div>
  );
}
