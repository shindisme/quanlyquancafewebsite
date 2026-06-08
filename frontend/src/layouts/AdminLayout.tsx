/**
 * AdminLayout — Layout cho quản trị viên (role = ADMIN)
 *
 * THAY ĐỔI:
 * - Dùng Sidebar & Header từ components/common/ (dùng chung với Staff)
 * - Thêm check role: nếu là STAFF → redirect /staff/pos
 * - Truyền basePath="/admin" cho Sidebar/Header
 */

import { Outlet, Navigate } from 'react-router-dom';
import SidebarComponent from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();

  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('tokenExpiry');
  // eslint-disable-next-line react-hooks/purity
  const isExpired = !expiry || Date.now() > parseInt(expiry);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#faf8f5', fontFamily: 'var(--admin-font)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid #e8e0d8', borderTopColor: '#b45309',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#a8a29e', fontSize: 14, fontWeight: 500 }}>Đang tải...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user || !token || isExpired) {
    return <Navigate to="/login" replace />;
  }

  // Staff không được vào Admin → redirect
  if (user.role === 'STAFF') {
    return <Navigate to="/staff/pos" replace />;
  }

  const sidebarWidth = collapsed ? 80 : 260;

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5' }}>
      <SidebarComponent
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        role="ADMIN"
        basePath="/admin"
      />

      <div style={{
        marginLeft: sidebarWidth,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Header basePath="/admin" />

        <main className="admin-scroll" style={{
          flex: 1, overflowY: 'auto',
          padding: '28px 32px',
          background: '#faf8f5',
        }}>
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
