import {
  doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, query, where, orderBy
} from 'firebase/firestore';
import { db } from './firebase';

// 유저의 entries 컬렉션 참조
function entriesRef(userId) {
  return collection(db, 'users', userId, 'entries');
}

// 특정 날짜 문서 참조
function entryRef(userId, date) {
  return doc(db, 'users', userId, 'entries', date);
}

// 월별 기록 가져오기
export async function fetchEntries(userId, { year, month } = {}) {
  const ref = entriesRef(userId);
  let q = query(ref, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);
  let entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (year && month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    entries = entries.filter(e => e.date.startsWith(prefix));
  }

  return entries;
}

// 특정 날짜 기록 가져오기
export async function fetchEntry(userId, date) {
  const snapshot = await getDoc(entryRef(userId, date));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

// 기록 저장 (생성 또는 수정)
export async function saveEntry(userId, { date, emotion, score, content }) {
  const ref = entryRef(userId, date);
  const now = new Date().toISOString();
  const existing = await getDoc(ref);

  await setDoc(ref, {
    date,
    emotion,
    score,
    content: content ?? '',
    updatedAt: now,
    createdAt: existing.exists() ? existing.data().createdAt : now,
  });

  return { date, emotion, score, content };
}

// 기록 삭제
export async function deleteEntry(userId, date) {
  await deleteDoc(entryRef(userId, date));
}

// 통계 가져오기
export async function fetchStats(userId, period = 'month') {
  const ref = entriesRef(userId);
  const snapshot = await getDocs(query(ref, orderBy('date', 'asc')));
  const all = snapshot.docs.map(d => d.data());

  const now = new Date();
  const cutoff = new Date();
  if (period === 'week') cutoff.setDate(now.getDate() - 7);
  else if (period === 'month') cutoff.setDate(now.getDate() - 30);
  else if (period === 'year') cutoff.setFullYear(now.getFullYear() - 1);

  const filtered = all.filter(e => new Date(e.date) >= cutoff);

  // 감정 분포
  const distMap = {};
  filtered.forEach(e => {
    distMap[e.emotion] = (distMap[e.emotion] || 0) + 1;
  });
  const distribution = Object.entries(distMap)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);

  // 점수 추이
  const trend = filtered.map(e => ({ date: e.date, score: e.score, emotion: e.emotion }));

  return { distribution, trend };
}
