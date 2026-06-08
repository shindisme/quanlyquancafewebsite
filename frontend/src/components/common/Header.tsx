import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  basePath: string; // '/admin' hoặc '/staff'
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
            padding: '6px 12px 6px 6px',
            borderRadius: 12, border: '1.5px solid #e8e0d8',
            background: 'white', cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--inner-shadow)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d6cdc5'; e.currentTarget.style.background = '#faf8f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e0d8'; e.currentTarget.style.background = 'white'; }}
        >

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
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f5f0eb' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#292018' }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 2 }}>@{user?.username}</p>
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
