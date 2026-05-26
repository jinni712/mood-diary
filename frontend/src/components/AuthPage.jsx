import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './AuthPage.css';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError('로그인에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌈</div>
        <h1 className="auth-title">무드다이어리</h1>
        <p className="auth-subtitle">
          오늘의 감정을 기록하고<br />나만의 감정 이야기를 써보세요
        </p>

        <button
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="google-icon"
          />
          {loading ? '로그인 중...' : 'Google로 시작하기'}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-notice">
          로그인하면 내 일기는 나만 볼 수 있어요 🔒
        </p>
      </div>
    </div>
  );
}
