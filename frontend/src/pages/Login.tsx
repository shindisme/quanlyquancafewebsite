import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const COLS = 9;
const ROWS = 9;

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const target = user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/pos';
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (trimmedUser.length < 3) {
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const { accessToken, user: loggedUser } = await authService.login(trimmedUser, password);
      login(accessToken, loggedUser);
      toast.success(`Chào mừng, ${loggedUser.name}!`);

      // Redirect theo role
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/staff/pos', { replace: true });
      }
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number; data?: { message?: string } } };

      if (axErr.response?.status === 401) {
        toast.error('Tài khoản hoặc mật khẩu không chính xác');
      } else if (axErr.response?.data?.message) {
        toast.error(axErr.response.data.message);
      } else {
        toast.error('Kết nối đến máy chủ thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative', width: '100%', height: '100vh', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1e1e2d',
        fontFamily: 'var(--admin-font)',
      }}
    >
      {/* bg lưới */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => (
          <span
            key={i}
            className='
            aspect-square
            border border-white/4
            cursor-default
            transition-colors duration-500 

            hover:bg-yellow-300/70 hover:duration-0
            hover:shadow-[0_0_15px_3px_rgba(251,191,36,0.5)]
            hover:relative hover:z-10
            '
          />
        ))}
      </div>

      {/* Login form */}
      <div className="animate-scaleIn" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, margin: '0 16px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 24, padding: '48px 40px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary-color)', letterSpacing: '-0.02em' }}>
              Đăng Nhập
            </h1>
            <p style={{ fontSize: 24, color: 'var(--text-primary-color)', marginTop: 6, fontWeight: 400 }}>
              Hệ Thống Quản Lý Quán Cafe
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#b45309', marginBottom: 8 }}>
                Tên đăng nhập/ Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                autoComplete="username"
                style={{
                  width: '100%', padding: '13px 16px', fontSize: 14,
                  background: '#faf8f5', border: '2px solid #e8e0d8',
                  borderRadius: 12, outline: 'none', color: '#292018',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--admin-font)',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#b45309'; e.target.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e0d8'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#b45309', marginBottom: 8 }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '13px 16px', fontSize: 14,
                  background: '#faf8f5', border: '2px solid #e8e0d8',
                  borderRadius: 12, outline: 'none', color: '#292018',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--admin-font)',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#b45309'; e.target.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e0d8'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: 13, color: '#b45309', cursor: 'pointer',
                  fontWeight: 600, fontFamily: 'var(--admin-font)',
                  textDecoration: 'underline', textUnderlineOffset: 2,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#92400e'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#b45309'; }}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', marginTop: 4,
                borderRadius: 12, border: 'none', fontWeight: 700,
                color: 'white', fontSize: 15, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgb(243 200 167), rgb(6 115 217))',
                transform: 'translateY(0)',
                fontFamily: 'var(--admin-font)',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(180,83,9,0.45)'; } }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(180,83,9,0.35)'; }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes shakeX { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }`}</style>
    </div>
  );
};

export default Login;
