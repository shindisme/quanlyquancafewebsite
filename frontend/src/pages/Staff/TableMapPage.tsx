import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Table2, MapPin, DollarSign, X, CreditCard, FileText } from 'lucide-react';
import tableService from '../../services/tableService';
import areaService from '../../services/areaService';
import invoiceService from '../../services/invoiceService';
import couponService from '../../services/couponService';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';

interface Area { id: string; name: string; }
interface TableItem { id: string; name: string; areaId: string; code: string; isBooked: boolean; area?: Area; }

const TableMapPage = () => {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filterArea, setFilterArea] = useState('all');
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'VNPAY'>('CASH');
  const [processing, setProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const calculateDiscount = (total: number, coupon: any) => {
    if (!coupon) return 0;
    if (coupon.discountType === 'PERCENT') {
      let discount = (total * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      return discount;
    }
    return coupon.discountValue;
  };

  const fetchData = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([tableService.getAll(), areaService.getAll()]);
      setTables(t);
      setAreas(a);
    } catch { }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useAutoRefresh(fetchData, 15000);

  const handleTableClick = async (table: TableItem) => {
    setSelectedTable(table);
    if (table.isBooked) {
      setLoadingInvoice(true);
      try {
        const inv = await invoiceService.getByTable(table.id);
        setInvoice(inv);
      } catch {
        setInvoice(null);
      } finally {
        setLoadingInvoice(false);
      }
    } else {
      setInvoice(null);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;
    try {
      setProcessing(true);
      await invoiceService.processPayment(invoice.id, {
        method: paymentMethod,
        couponCode: couponCode || undefined,
      });
      toast.success('Thanh toán thành công!');
      setPaymentModal(false);
      setSelectedTable(null);
      setInvoice(null);
      setCouponCode('');
      setAppliedCoupon(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      setProcessing(true);
      const res = await couponService.apply(couponCode);
      const coupon = res.data;
      if (coupon.minValue && (invoice?.totalAmount || 0) < coupon.minValue) {
        toast.error(`Đơn hàng tối thiểu để áp mã này là ${formatCurrency(coupon.minValue)}`);
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(coupon);
      toast.success(res.message || 'Mã giảm giá hợp lệ!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setCouponCode('');
      setAppliedCoupon(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;
    try {
      await invoiceService.cancel(invoice.id);
      toast.success('Đã huỷ hoá đơn');
      setSelectedTable(null);
      setInvoice(null);
      setAppliedCoupon(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Huỷ thất bại');
    }
  };

  const filteredTables = tables.filter(t => filterArea === 'all' || t.areaId === filterArea);
  const bookedCount = tables.filter(t => t.isBooked).length;
  const freeCount = tables.filter(t => !t.isBooked).length;

  return (
    <div style={{ fontFamily: 'var(--admin-font)' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292018' }}>
            <MapPin size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Sơ đồ bàn
          </h2>
          <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>{freeCount} trống</span>
            {' · '}
            <span style={{ color: '#dc2626', fontWeight: 600 }}>{bookedCount} đang dùng</span>
          </p>
        </div>
      </div>

      {/* Filter khu vực */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterArea('all')}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filterArea === 'all' ? '#b45309' : '#f1f5f9',
            color: filterArea === 'all' ? 'white' : '#64748b',
            fontFamily: 'var(--admin-font)',
          }}
        >Tất cả</button>
        {areas.map(a => (
          <button
            key={a.id}
            onClick={() => setFilterArea(a.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: filterArea === a.id ? '#b45309' : '#f1f5f9',
              color: filterArea === a.id ? 'white' : '#64748b',
              fontFamily: 'var(--admin-font)',
            }}
          >{a.name}</button>
        ))}
      </div>

      {/* Grid bàn */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {filteredTables.map(t => (
          <button
            key={t.id}
            onClick={() => handleTableClick(t)}
            style={{
              padding: '24px 16px', borderRadius: 14,
              border: `2px solid ${t.isBooked ? '#fecaca' : '#dcfce7'}`,
              background: t.isBooked ? '#fef2f2' : 'white',
              cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.15s', fontFamily: 'var(--admin-font)',
              outline: selectedTable?.id === t.id ? '3px solid #b45309' : 'none',
              outlineOffset: -1,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Table2 size={32} style={{ margin: '0 auto 10px', color: t.isBooked ? '#dc2626' : '#16a34a' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#292018' }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#78716c', marginTop: 4 }}>{t.area?.name}</div>
            <span style={{
              display: 'inline-block', marginTop: 10, padding: '4px 12px', borderRadius: 6,
              fontSize: 11, fontWeight: 700,
              background: t.isBooked ? '#fee2e2' : '#dcfce7',
              color: t.isBooked ? '#dc2626' : '#16a34a',
            }}>
              {t.isBooked ? '● Đang dùng' : '● Trống'}
            </span>
          </button>
        ))}
      </div>

      {/* Invoice Detail Drawer */}
      {selectedTable && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', justifyContent: 'flex-end', zIndex: 100,
          }}
          onClick={() => { setSelectedTable(null); setInvoice(null); setAppliedCoupon(null); setCouponCode(''); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-slideIn"
            style={{
              width: 440, height: '100%', background: 'white',
              padding: '28px 24px', overflowY: 'auto',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
              fontFamily: 'var(--admin-font)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#292018' }}>
                <Table2 size={18} style={{ display: 'inline', marginRight: 8 }} />
                {selectedTable.name}
              </h3>
              <button onClick={() => { setSelectedTable(null); setInvoice(null); setAppliedCoupon(null); setCouponCode(''); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e',
              }}>
                <X size={22} />
              </button>
            </div>

            {loadingInvoice ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
              </div>
            ) : !invoice ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a8a29e' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>Bàn trống</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Chưa có hoá đơn nào</p>
              </div>
            ) : (
              <>
                {/* Invoice info */}
                <div style={{
                  padding: '14px 16px', borderRadius: 12, background: '#fef3c7',
                  border: '1px solid #fde68a', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#b45309' }}>Hoá đơn: {invoice.code}</div>
                  <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>
                    Tạo lúc: {formatDate(invoice.createdAt)} · {invoice.orders?.length || 0} lần gọi
                  </div>
                </div>

                {/* Orders list */}
                {invoice.orders?.map((order: any, idx: number) => (
                  <div key={order.id} style={{
                    marginBottom: 12, padding: '12px 14px', borderRadius: 10,
                    border: '1px solid #e8e0d8', background: '#faf8f5',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>
                        Lần {idx + 1} · {order.code}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.bg || '#f5f0eb',
                        color: ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || '#78716c',
                      }}>
                        {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                      </span>
                    </div>
                    {order.orderDetails?.map((d: any, i: number) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 12, color: '#57534e', padding: '3px 0',
                      }}>
                        <span>{d.quantity}x {d.product?.name}{d.size ? ` (${d.size.sizeName})` : ''}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(d.price * d.quantity)}</span>
                      </div>
                    ))}
                    <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#b45309', marginTop: 6 }}>
                      {formatCurrency(order.subTotal)}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div style={{
                  padding: '14px 0', borderTop: '2px solid #e8e0d8', marginTop: 8,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#292018' }}>Tổng cộng</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#b45309' }}>
                    {formatCurrency(invoice.totalAmount || 0)}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button
                    onClick={() => setPaymentModal(true)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--admin-font)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    Thanh toán
                  </button>
                  <button
                    onClick={handleCancelInvoice}
                    style={{
                      padding: '14px 20px', borderRadius: 12, border: '1.5px solid #fecaca',
                      background: '#fef2f2', color: '#dc2626',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--admin-font)',
                    }}
                  >
                    Huỷ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && invoice && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}
          onClick={() => setPaymentModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-scaleIn"
            style={{
              background: 'white', borderRadius: 20, padding: '32px',
              width: 400, boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              fontFamily: 'var(--admin-font)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#292018', marginBottom: 20 }}>
              Thanh toán hoá đơn
            </h3>

            <div style={{
              padding: '14px 16px', borderRadius: 12, background: '#faf8f5',
              border: '1px solid #e8e0d8', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#78716c', fontSize: 13 }}>Hoá đơn</span>
                <span style={{ fontWeight: 700, color: '#292018', fontSize: 13 }}>{invoice.code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#78716c', fontSize: 13 }}>Bàn</span>
                <span style={{ fontWeight: 700, color: '#292018', fontSize: 13 }}>{selectedTable?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#78716c', fontSize: 13 }}>Tổng tiền</span>
                <span style={{ fontWeight: 800, color: appliedCoupon ? '#292018' : '#b45309', fontSize: 16 }}>{formatCurrency(invoice.totalAmount || 0)}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ color: '#16a34a', fontSize: 13 }}>Giảm giá ({appliedCoupon.code})</span>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 16 }}>
                    -{formatCurrency(calculateDiscount(invoice.totalAmount || 0, appliedCoupon))}
                  </span>
                </div>
              )}
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e8e0d8' }}>
                  <span style={{ color: '#78716c', fontSize: 13, fontWeight: 700 }}>Thành tiền</span>
                  <span style={{ fontWeight: 800, color: '#b45309', fontSize: 18 }}>
                    {formatCurrency(Math.max(0, (invoice.totalAmount || 0) - calculateDiscount(invoice.totalAmount || 0, appliedCoupon)))}
                  </span>
                </div>
              )}
            </div>

            {/* Phương thức */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#57534e', display: 'block', marginBottom: 8 }}>Phương thức thanh toán</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['CASH', 'VNPAY'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${paymentMethod === m ? '#b45309' : '#e8e0d8'}`,
                      background: paymentMethod === m ? '#fef3c7' : 'white',
                      fontSize: 13, fontWeight: 700, fontFamily: 'var(--admin-font)',
                      color: paymentMethod === m ? '#b45309' : '#78716c',
                    }}
                  >
                    {m === 'CASH' ? 'Tiền mặt' : 'VNPay'}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#57534e', display: 'block', marginBottom: 8 }}>Mã giảm giá (nếu có)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã..."
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid #e8e0d8', fontSize: 13,
                    outline: 'none', fontFamily: 'var(--admin-font)',
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode || processing}
                  style={{
                    padding: '0 16px', borderRadius: 10, border: 'none',
                    background: '#e8e0d8', color: '#292018',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--admin-font)',
                    opacity: (!couponCode || processing) ? 0.6 : 1,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!processing && couponCode) e.currentTarget.style.background = '#d6cdc5'; }}
                  onMouseLeave={e => e.currentTarget.style.background = '#e8e0d8'}
                >
                  Áp dụng
                </button>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--admin-font)',
                opacity: processing ? 0.6 : 1,
              }}
            >
              {processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
          </div>
        </div>
      )}

      <style>{`.animate-slideIn { animation: slideInRight 0.3s ease; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

export default TableMapPage;
