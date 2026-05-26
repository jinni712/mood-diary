import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { fetchEntries } from '../api';
import { EMOTIONS } from './DiaryForm';
import './CalendarView.css';

export default function CalendarView({ onSelectDate }) {
  const [activeDate, setActiveDate] = useState(new Date());
  const [entryMap, setEntryMap] = useState({});

  useEffect(() => {
    loadMonth(activeDate);
  }, [activeDate]);

  async function loadMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    try {
      const entries = await fetchEntries({ year, month });
      const map = {};
      entries.forEach(e => { map[e.date] = e; });
      setEntryMap(map);
    } catch {}
  }

  function tileContent({ date, view }) {
    if (view !== 'month') return null;
    const key = date.toISOString().slice(0, 10);
    const entry = entryMap[key];
    if (!entry) return null;
    const em = EMOTIONS.find(e => e.key === entry.emotion);
    return (
      <div className="tile-emotion">
        <span>{em?.emoji}</span>
      </div>
    );
  }

  function handleClickDay(date) {
    const key = date.toISOString().slice(0, 10);
    onSelectDate(key);
  }

  function handleActiveStartDateChange({ activeStartDate }) {
    setActiveDate(activeStartDate);
  }

  const recordedCount = Object.keys(entryMap).length;

  return (
    <div className="calendar-view">
      <div className="calendar-summary">
        이번 달 <strong>{recordedCount}일</strong> 기록됨
      </div>
      <Calendar
        onClickDay={handleClickDay}
        onActiveStartDateChange={handleActiveStartDateChange}
        tileContent={tileContent}
        locale="ko-KR"
        calendarType="gregory"
        className="mood-calendar"
      />
      <p className="calendar-hint">날짜를 클릭하면 해당 날의 기록을 볼 수 있어요</p>
    </div>
  );
}
