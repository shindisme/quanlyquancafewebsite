/**
 * TrackingPage — Theo dõi đơn hàng của khách
 *
 * THAY ĐỔI:
 * - Tracking theo Invoice (hoá đơn bàn) thay vì từng Order lẻ
 * - Hiển thị tất cả lần gọi món (orders) trong Invoice
 * - Khi bàn đã thanh toán → Invoice status = PAID → khách vẫn xem được 
 *   (dữ liệu từ localStorage, tự xoá sau 4h)
 * - Auto refresh 15s
 *
 * LOGIC LƯU TRỮ:
 * - localStorage key: cafe_track_{tableCode}_{deviceId}
 * - Giá trị: mảng { orderId, invoiceId, orderCode, invoiceCode, createdAt }
 * - TTL: 4 giờ → tự xoá khi hết hạn
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, RefreshCw, Coffee, FileText } from 'lucide-react';
import publicService from '../../services/publicService';
import type { TableInfo } from '../../layouts/PublicLayout';
import { ORDER_STATUS, INVOICE_STATUS } from '../../utils/constants';
import type { OrderStatusKey, InvoiceStatusKey } from '../../utils/constants';

const TTL_MS = 4 * 60 * 60 * 1000; // 4 giờ

function getTrackKey(tableCode: string) {
  const deviceId = localStorage.getItem('cafe_device_id');
  return `cafe_track_${tableCode}_${deviceId}`;
}

interface TrackedItem {
  orderId: string;
  invoiceId: string;
  invoiceCode: string;
  orderCode: string;
  createdAt: number;
}

const TrackingPage = () => {
  const { table } = useOutletContext<{ table: TableInfo }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);

  const loadTracking = useCallback(async () => {
    try {
      // 1. Đọc localStorage
      const trackKey = getTrackKey(table.code);
      const raw = localStorage.getItem(trackKey);
      if (!raw) { setInvoice(null); setLoading(false); return; }

      let items: TrackedItem[] = JSON.parse(raw);
      
      // 2. Lọc bỏ items quá 4 giờ
      const validItems = items.filter(i => Date.now() - i.createdAt < TTL_MS);
      if (validItems.length !== items.length) {
        if (validItems.length === 0) {
          localStorage.removeItem(trackKey);
        } else {
          localStorage.setItem(trackKey, JSON.stringify(validItems));
        }
      }

      if (validItems.length === 0) {
        setInvoice(null);
        setTrackedItems([]);
        setLoading(false);
        return;
      }

      setTrackedItems(validItems);

      // 3. Lấy Invoice từ API (theo bàn)
      try {
        const inv = await publicService.getInvoiceByTable(table.id);
        setInvoice(inv);
      } catch {
        // Invoice đã thanh toán → fetch individual orders fallback
        const orderResults = await Promise.all(
          validItems.map(async (item) => {
            try {
              return await publicService.getOrder(item.orderId);
            } catch {
              return null;
            }
          })
        );
        const validOrders = orderResults.filter(Boolean);
        if (validOrders.length > 0) {
          // Tạo invoice giả từ orders để hiển thị
          setInvoice({
            code: validItems[0].invoiceCode,
            status: 'PAID',
            totalAmount: validOrders.reduce((s: number, o: any) => s + (o?.subTotal || 0), 0),
            orders: validOrders,
          });
        }
      }
    } catch {
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [table.code, table.id]);

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 15000);
    return () => clearInterval(interval);
  }, [loadTracking]);

  const getStatusStep = (status: string) => {
    const steps = ['PENDING', 'CONFIRMED', 'COMPLETED'];
    return steps.indexOf(status);
  };

  return (
    <div style={{ fontFamily: 'var(--admin-font)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, background: '#fff',
        padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0ebe5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(`/table/${table.code}`)} style={{
            width: 40, height: 40, borderRadius: 12, border: '1.5px solid #e8e0d8',
            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary-color)',
          }}><ArrowLeft size={18} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary-color)' }}>Đơn hàng của bạn</h2>
        </div>
        <button onClick={() => { setLoading(true); loadTracking(); }} style={{
          width: 40, height: 40, borderRadius: 12, border: '1.5px solid #e8e0d8',
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c',
        }}><RefreshCw size={16} /></button>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8e0d8', borderTopColor: '#b45309', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !invoice ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
            <Coffee size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>Chưa có đơn hàng nào</p>
            <button onClick={() => navigate(`/table/${table.code}`)} style={{
              marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none',
              background: 'var(--gd-button)', color: 'var(--text-primary-color)', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--admin-font)',
              boxShadow: 'var(--drop-shadow)'
            }}>Đặt món</button>
          </div>
        ) : (
          <>
            {/* Invoice header */}
            <div style={{
              background: invoice.status === 'PAID' ? '#dcfce7' : '#fef3c7',
              borderRadius: 0, padding: '14px 16px', marginBottom: 16,
              border: `1px solid ${invoice.status === 'PAID' ? '#bbf7d0' : '#fde68a'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} color={invoice.status === 'PAID' ? '#16a34a' : '#b45309'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: invoice.status === 'PAID' ? '#16a34a' : '#b45309' }}>
                    {invoice.code}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#78716c', marginTop: 4, display: 'block' }}>
                  {table.name} · {invoice.orders?.length || 0} lần gọi
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: INVOICE_STATUS[invoice.status as InvoiceStatusKey]?.bg || '#f5f0eb',
                  color: INVOICE_STATUS[invoice.status as InvoiceStatusKey]?.color || '#78716c',
                }}>
                  {INVOICE_STATUS[invoice.status as InvoiceStatusKey]?.label || invoice.status}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-orange-color)', marginTop: 4 }}>
                  {(invoice.totalAmount || 0).toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(invoice.orders || []).map((order: any, idx: number) => {
                const statusIdx = getStatusStep(order.status);
                const isCancelled = order.status === 'CANCELLED';
                const statusInfo = ORDER_STATUS[order.status as OrderStatusKey];

                return (
                  <div key={order.id} style={{
                    background: '#fff', borderRadius: 0, border: '1px solid #f0ebe5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                  }}>
                    {/* Order header */}
                    <div style={{
                      padding: '12px 16px', borderBottom: '1px solid #f0ebe5',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary-color)' }}>
                          Lần {idx + 1} · {order.code}
                        </p>
                        <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: statusInfo?.bg || '#f5f0eb',
                        color: statusInfo?.color || '#78716c',
                      }}>
                        {statusInfo?.label || order.status}
                      </span>
                    </div>

                    {/* Status tracker (if not cancelled) */}
                    {!isCancelled && (
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          {['PENDING', 'CONFIRMED', 'COMPLETED'].map((step, i) => {
                            const isDone = i <= statusIdx;
                            const stepInfo = ORDER_STATUS[step as OrderStatusKey];
                            return (
                              <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                  background: isDone ? stepInfo.color : '#f0ebe5',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.3s',
                                }}>
                                  {isDone
                                    ? <CheckCircle2 size={14} color="#fff" />
                                    : <Clock size={12} color="#d6cdc5" />
                                  }
                                </div>
                                {i < 2 && (
                                  <div style={{
                                    flex: 1, height: 2,
                                    background: i < statusIdx ? stepInfo.color : '#f0ebe5',
                                    transition: 'background 0.3s',
                                  }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: '#a8a29e' }}>Chờ</span>
                          <span style={{ fontSize: 10, color: '#a8a29e' }}>Đang làm</span>
                          <span style={{ fontSize: 10, color: '#a8a29e' }}>Xong</span>
                        </div>
                      </div>
                    )}
                    {isCancelled && (
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
                        <XCircle size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Đã huỷ</span>
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ padding: '0 16px 12px' }}>
                      {order.orderDetails?.map((d: any, i: number) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                          fontSize: 12, color: '#57534e',
                        }}>
                          <span>x{d.quantity} {d.product?.name}{d.size ? ` (${d.size.sizeName})` : ''}</span>
                          <span style={{ fontWeight: 600 }}>{(d.price * d.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#b45309', marginTop: 4, borderTop: '1px dashed #f0ebe5', paddingTop: 6 }}>
                        {(order.subTotal || 0).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paid notice */}
            {invoice.status === 'PAID' && (
              <div style={{
                background: '#dcfce7', borderRadius: 12, padding: '12px 16px', marginTop: 16,
                border: '1px solid #bbf7d0', fontSize: 13, color: '#16a34a', textAlign: 'center', fontWeight: 600,
              }}>
                ✅ Hoá đơn đã được thanh toán. Cảm ơn quý khách!
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, padding: '12px 16px 16px',
        background: '#fff', borderTop: '1px solid #f0ebe5', zIndex: 100,
      }}>
        <button onClick={() => navigate(`/table/${table.code}`)} style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: 'var(--gd-button)', color: 'var(--text-primary-color)',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--admin-font)',
          boxShadow: 'var(--drop-shadow)',
        }}>
          Đặt thêm món
        </button>
      </div>
    </div>
  );
};

export default TrackingPage;
