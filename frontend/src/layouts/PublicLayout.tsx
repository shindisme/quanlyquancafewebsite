import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CartProvider } from '../context/CartContext';
import publicService from '../services/publicService';

export interface TableInfo {
  id: string;
  name: string;
  code: string;
  area?: { id: string; name: string };
}

function PublicLayout() {
  const { tableCode } = useParams<{ tableCode: string }>();
  const [table, setTable] = useState<TableInfo | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableCode) return;
    publicService.getTableByCode(tableCode)
      .then((t) => { setTable(t); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tableCode]);

  if (loading) {
    return (
      <div className="public-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e8e0d8', borderTopColor: '#b45309', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#a8a29e', fontSize: 14, fontFamily: 'var(--admin-font)' }}>Đang tải...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="public-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--admin-font)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#292018', marginBottom: 8 }}>Không tìm thấy bàn</h2>
          <p style={{ fontSize: 14, color: '#a8a29e' }}>Vui lòng quét mã QR tại bàn</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider tableCode={tableCode!}>
      <div className="public-container"
        style={{
          background: 'var(--bg-color)',
          boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.25)'
        }}
      >
        <Outlet context={{ table }} />
      </div>
    </CartProvider>
  );
}

export default PublicLayout;
