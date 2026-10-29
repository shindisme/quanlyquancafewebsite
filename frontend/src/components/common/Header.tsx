import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  basePath: string;
}

const Header = ({ basePath }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase()
    : 'AD';

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 64, background: '#e3e8ec',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: 'var(--drop-shadow)',
      padding: '0 28px', fontFamily: 'var(--admin-font)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div></div>
      {/* User dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 12px 5px 6px',
            borderRadius: 12, border: '1.5px solid #e8e0d8',
            background: 'white', cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d6cdc5'; e.currentTarget.style.background = '#faf8f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e0d8'; e.currentTarget.style.background = 'white'; }}
        >
          {/* Avatar vuông bo tròn */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1.5px solid #d1d5db',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#d1d5db',
            flexShrink: 0,
          }}>
            <img
              src="/default-avatar.svg"
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#292018', lineHeight: 1.2 }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 1 }}>{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
          </div>
          <ChevronDown size={14} style={{ color: '#a8a29e', transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {dropOpen && (
          <div className="animate-slideDown" style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 220, background: 'white', borderRadius: 14,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            overflow: 'hidden', zIndex: 50, fontFamily: 'var(--admin-font)',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f5f0eb', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: '1.5px solid #d1d5db',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#d1d5db',
              }}>
                <img
                  src="/default-avatar.svg"
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#292018', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 2 }}>@{user?.username}</p>
              </div>
            </div>
            <div style={{ padding: '6px' }}>
              <button
                onClick={() => { setDropOpen(false); navigate(`${basePath}/profile`); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', border: 'none', background: 'transparent',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  color: '#57534e', transition: 'background 0.15s', fontFamily: 'var(--admin-font)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f0eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <UserCircle size={15} /> Thông tin tài khoản
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', border: 'none', background: 'transparent',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  color: '#dc2626', transition: 'background 0.15s', fontFamily: 'var(--admin-font)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={15} /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
