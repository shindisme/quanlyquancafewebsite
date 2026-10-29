import { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, Search, RefreshCw } from 'lucide-react';
import invoiceService from '../../../services/invoiceService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { INVOICE_STATUS } from '../../../utils/constants';
import type { InvoiceStatusKey } from '../../../utils/constants';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'UNPAID', label: 'Chưa TT' },
  { key: 'PAID', label: 'Đã TT' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
];

const InvoiceManage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [detailInvoice, setDetailInvoice] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await invoiceService.getAll(status);
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleViewDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const data = await invoiceService.getById(id);
      setDetailInvoice(data);
    } catch { /* silent */ } finally {
      setDetailLoading(false);
    }
  };

  const filtered = invoices.filter(inv =>
    inv.code?.toLowerCase().includes(search.toLowerCase()) ||
    inv.table?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn" style={{ fontFamily: 'var(--admin-font)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292018' }}>
            <FileText size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Quản lý hoá đơn
          </h2>
          <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
            {filtered.length} hoá đơn
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã, bàn..."
              style={{
                padding: '8px 14px 8px 34px', borderRadius: 10, border: '1.5px solid #e8e0d8',
                fontSize: 13, outline: 'none', fontFamily: 'var(--admin-font)', width: 200,
              }}
            />
          </div>
          <button onClick={fetchInvoices} style={{
            width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e8e0d8',
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><RefreshCw size={16} color="#78716c" /></button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--admin-font)',
            background: filterStatus === tab.key ? '#b45309' : '#f1f5f9',
            color: filterStatus === tab.key ? 'white' : '#64748b',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>Không có hoá đơn</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 0, border: '1.5px solid #e8e0d8', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, borderRadius: 0 }}>
            <thead>
              <tr style={{ background: '#faf8f5', borderBottom: '1.5px solid #e8e0d8' }}>
                {['Mã', 'Bàn', 'Tổng tiền', 'Giảm giá', 'Thanh toán', 'Trạng thái', 'Thời gian', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#78716c', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const statusInfo = INVOICE_STATUS[inv.status as InvoiceStatusKey];
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f5f0eb' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#faf8f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#b45309' }}>{inv.code}</td>
                    <td style={{ padding: '12px 16px', color: '#292018' }}>{inv.table?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#292018' }}>{formatCurrency(inv.totalAmount)}</td>
                    <td style={{ padding: '12px 16px', color: inv.discountAmount > 0 ? '#16a34a' : '#a8a29e' }}>
                      {inv.discountAmount > 0 ? `-${formatCurrency(inv.discountAmount)} ${inv.coupon?.code ? `(${inv.coupon.code})` : ''}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#292018' }}>{formatCurrency(inv.finalAmount)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: statusInfo?.bg || '#f5f0eb',
                        color: statusInfo?.color || '#78716c',
                      }}>{statusInfo?.label || inv.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#78716c', fontSize: 12 }}>{formatDate(inv.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleViewDetail(inv.id)} style={{
                        width: 32, height: 32, borderRadius: 8, border: '1px solid #e8e0d8',
                        background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Eye size={14} color="#78716c" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer */}
      {detailInvoice && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', justifyContent: 'flex-end', zIndex: 100,
        }} onClick={() => setDetailInvoice(null)}>
          <div onClick={e => e.stopPropagation()} className="animate-slideIn" style={{
            width: 460, height: '100%', background: 'white', padding: '28px 24px',
            overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
            fontFamily: 'var(--admin-font)',
          }}>
            {detailLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#292018' }}>Hoá đơn: {detailInvoice.code}</h3>
                  <button onClick={() => setDetailInvoice(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#a8a29e',
                  }}>×</button>
                </div>

                {/* Invoice info */}
                <div style={{
                  padding: '14px 16px', borderRadius: 0, background: '#faf8f5',
                  border: '1px solid #e8e0d8', marginBottom: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#78716c' }}>Bàn</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>{detailInvoice.table?.name || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#78716c' }}>Nhân viên thu</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#292018' }}>{detailInvoice.user?.name || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#78716c' }}>Tổng tiền</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#292018' }}>{formatCurrency(detailInvoice.totalAmount)}</span>
                  </div>
                  {detailInvoice.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#16a34a' }}>Giảm giá ({detailInvoice.coupon?.code})</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>-{formatCurrency(detailInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px dashed #e8e0d8', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#b45309' }}>Thực thu</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>{formatCurrency(detailInvoice.finalAmount)}</span>
                  </div>
                </div>

                {/* Orders */}
                <p style={{ fontSize: 14, fontWeight: 700, color: '#292018', marginBottom: 12 }}>
                  Danh sách lần gọi ({detailInvoice.orders?.length || 0})
                </p>
                {detailInvoice.orders?.map((order: any, idx: number) => (
                  <div key={order.id} style={{
                    marginBottom: 10, padding: '12px 14px', borderRadius: 0,
                    border: '1px solid #e8e0d8', background: '#faf8f5',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>
                        Lần {idx + 1} · {order.code}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#b45309' }}>
                        {formatCurrency(order.subTotal)}
                      </span>
                    </div>
                    {order.orderDetails?.map((d: any, i: number) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 12, color: '#57534e', padding: '2px 0',
                      }}>
                        <span>{d.quantity}x {d.product?.name}{d.size ? ` (${d.size.sizeName})` : ''}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(d.price * d.quantity)}</span>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Payments */}
                {detailInvoice.payments?.length > 0 && (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#292018', marginBottom: 12, marginTop: 16 }}>
                      Thanh toán
                    </p>
                    {detailInvoice.payments.map((p: any) => (
                      <div key={p.id} style={{
                        padding: '10px 14px', borderRadius: 0, background: '#dcfce7',
                        border: '1px solid #bbf7d0', marginBottom: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        display: 'flex', justifyContent: 'space-between', fontSize: 13,
                      }}>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>
                          {p.method === 'CASH' ? '💵 Tiền mặt' : '📱 VNPay'}
                        </span>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`.animate-slideIn { animation: slideInRight 0.3s ease; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

export default InvoiceManage;
