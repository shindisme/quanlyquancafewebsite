import { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, RefreshCw, Search } from 'lucide-react';
import invoiceService from '../../services/invoiceService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { INVOICE_STATUS } from '../../utils/constants';
import type { InvoiceStatusKey } from '../../utils/constants';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'UNPAID', label: 'Chưa TT' },
  { key: 'PAID', label: 'Đã TT' },
];

const StaffInvoiceList = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const data = await invoiceService.getAll(status);
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleViewDetail = async (id: string) => {
    try {
      const data = await invoiceService.getById(id);
      setDetail(data);
    } catch { /* silent */ }
  };

  const filtered = invoices.filter(inv =>
    inv.code?.toLowerCase().includes(search.toLowerCase()) ||
    inv.table?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn" style={{ fontFamily: 'var(--admin-font)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292018' }}>
            <FileText size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Hoá đơn
          </h2>
          <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>{filtered.length} hoá đơn</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã, bàn..."
              style={{ padding: '8px 14px 8px 34px', borderRadius: 10, border: '1.5px solid #e8e0d8', fontSize: 13, outline: 'none', fontFamily: 'var(--admin-font)', width: 180 }}
            />
          </div>
          <button onClick={fetchData} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e8e0d8', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={16} color="#78716c" />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--admin-font)',
            background: filter === tab.key ? '#b45309' : '#f1f5f9',
            color: filter === tab.key ? 'white' : '#64748b',
          }}>{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>Không có hoá đơn</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(inv => {
            const statusInfo = INVOICE_STATUS[inv.status as InvoiceStatusKey];
            return (
              <div key={inv.id} onClick={() => handleViewDetail(inv.id)} style={{
                background: 'white', borderRadius: 14, border: '1.5px solid #e8e0d8', padding: '14px 18px',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b45309'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e0d8'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#b45309' }}>{inv.code}</div>
                  <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>
                    {inv.table?.name || '—'} · {inv._count?.orders || 0} lần gọi · {formatDate(inv.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: statusInfo?.bg || '#f5f0eb', color: statusInfo?.color || '#78716c',
                  }}>{statusInfo?.label || inv.status}</span>
                  
                  {inv.discountAmount > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                      -{formatCurrency(inv.discountAmount)} {inv.coupon?.code ? `(${inv.coupon.code})` : ''}
                    </span>
                  )}
                  
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#b45309' }}>{formatCurrency(inv.finalAmount || inv.totalAmount)}</span>
                  <Eye size={16} color="#a8a29e" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={() => setDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 420, height: '100%', background: 'white', padding: '28px 24px',
            overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)', fontFamily: 'var(--admin-font)',
            animation: 'slideInRight 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#292018' }}>{detail.code}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#a8a29e' }}>×</button>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 12, background: '#faf8f5', border: '1px solid #e8e0d8', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#78716c' }}>Bàn</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>{detail.table?.name || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#78716c' }}>Tổng tiền</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#292018' }}>{formatCurrency(detail.totalAmount)}</span>
              </div>
              {detail.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#16a34a' }}>Giảm giá</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>-{formatCurrency(detail.discountAmount)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px dashed #e8e0d8', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#b45309' }}>Thực thu</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>{formatCurrency(detail.finalAmount)}</span>
              </div>
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, color: '#292018', marginBottom: 12 }}>Các lần gọi ({detail.orders?.length || 0})</p>
            {detail.orders?.map((order: any, idx: number) => (
              <div key={order.id} style={{ marginBottom: 10, padding: '12px 14px', borderRadius: 10, border: '1px solid #e8e0d8', background: '#faf8f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>Lần {idx + 1} · {order.code}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#b45309' }}>{formatCurrency(order.subTotal)}</span>
                </div>
                {order.orderDetails?.map((d: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#57534e', padding: '2px 0' }}>
                    <span>{d.quantity}x {d.product?.name}{d.size ? ` (${d.size.sizeName})` : ''}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(d.price * d.quantity)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

export default StaffInvoiceList;
