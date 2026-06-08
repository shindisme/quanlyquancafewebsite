/**
 * CheckoutPage — Xác nhận đặt món
 *
 * THAY ĐỔI so với phiên bản cũ:
 * - Không có trang PaymentPage riêng nữa (nhân viên thanh toán)
 * - Khách chỉ xác nhận rồi gửi đơn
 * - Coupon bỏ khỏi flow khách (nhân viên nhập coupon khi thanh toán)
 * - Sau khi đặt → lưu invoiceId vào localStorage theo bàn + deviceId
 * - Redirect sang TrackingPage
 */

import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, ImageOff, Send } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import publicService from '../../services/publicService';
import { toast } from 'react-toastify';
import type { TableInfo } from '../../layouts/PublicLayout';

/** Key localStorage lưu lịch sử đơn hàng theo thiết bị + bàn */
function getTrackKey(tableCode: string) {
  const deviceId = localStorage.getItem('cafe_device_id') || crypto.randomUUID();
  if (!localStorage.getItem('cafe_device_id')) {
    localStorage.setItem('cafe_device_id', deviceId);
  }
  return `cafe_track_${tableCode}_${deviceId}`;
}

const CheckoutPage = () => {
  const { table } = useOutletContext<{ table: TableInfo }>();
  const navigate = useNavigate();
  const { items, totalPrice, totalCount, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    try {
      setSubmitting(true);

      const orderItems = items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId || undefined,
        quantity: item.quantity,
        price: item.price + item.extraPrice + item.toppings.reduce((s, t) => s + t.price, 0),
        note: item.note || undefined,
        toppings: item.toppings.map((t) => ({ toppingId: t.toppingId, price: t.price })),
      }));

      const result = await publicService.createOrder({
        tableId: table.id,
        items: orderItems,
      });

      // Lưu order vào localStorage để tracking
      const trackKey = getTrackKey(table.code);
      const existingRaw = localStorage.getItem(trackKey);
      let tracked: { orderId: string; invoiceId: string; invoiceCode: string; orderCode: string; createdAt: number }[] = [];
      if (existingRaw) {
        try { tracked = JSON.parse(existingRaw); } catch { /* empty */ }
      }
      tracked.push({
        orderId: result.order.id,
        invoiceId: result.invoiceId,
        invoiceCode: result.invoiceCode,
        orderCode: result.order.code,
        createdAt: Date.now(),
      });
      localStorage.setItem(trackKey, JSON.stringify(tracked));

      clearCart();
      toast.success('Đặt món thành công! Vui lòng chờ nhân viên phục vụ.');
      navigate(`/table/${table.code}/tracking`, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đặt đơn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--admin-font)', padding: 20, textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#292018' }}>Giỏ hàng trống</p>
        <button onClick={() => navigate(`/table/${table.code}`)} style={{
          marginTop: 16, padding: '12px 24px', borderRadius: 12, border: 'none',
          background: 'var(--gd-button)', color: 'var(--text-primary-color)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--admin-font)',
          boxShadow: 'var(--drop-shadow)',
        }}>Quay lại thực đơn</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--admin-font)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, background: '#fff',
        padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #f0ebe5',
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: 40, height: 40, borderRadius: 12, border: '1.5px solid #e8e0d8',
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary-color)',
        }}><ArrowLeft size={18} /></button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary-color)' }}>Xác nhận đặt món</h2>
      </div>

      {/* Items */}
      <div style={{ padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0ebe5', overflow: 'hidden' }}>
          {items.map((item, idx) => {
            const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
            const unitPrice = item.price + item.extraPrice + toppingTotal;
            return (
              <div key={item.cartItemId} style={{
                display: 'flex', gap: 12, padding: '14px 16px',
                borderBottom: idx < items.length - 1 ? '1px solid #f0ebe5' : 'none',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
                  background: '#f0ebe5', flexShrink: 0,
                }}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={20} color="#a8a29e" /></div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#292018' }}>
                        <span style={{ color: '#b45309', fontWeight: 700, marginRight: 6 }}>x{item.quantity}</span>
                        {item.name}
                      </p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#292018', flexShrink: 0 }}>{(unitPrice * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 4 }}>
                    {item.sizeName && <span>{item.sizeName}</span>}
                    {item.toppings.length > 0 && <span>{item.sizeName ? ', ' : ''}{item.toppings.map(t => t.name).join(', ')}</span>}
                  </div>
                  {item.note && <div style={{ fontSize: 11, color: '#78716c', marginTop: 2, fontStyle: 'italic' }}>📝 {item.note}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div style={{
          background: '#fef3c7', borderRadius: 12, padding: '12px 16px', marginTop: 12,
          border: '1px solid #fde68a', fontSize: 13, color: '#92400e', lineHeight: 1.6,
        }}>
          <strong>💡 Lưu ý:</strong> Đơn hàng sẽ được gửi đến quầy pha chế. Thanh toán tại quầy khi ra về.
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0ebe5', padding: '16px', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#78716c' }}>Tổng ({totalCount} món)</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#292018' }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={{ borderTop: '2px dashed #f0ebe5', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-orange-color)' }}>Thành tiền</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-orange-color)' }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, padding: '12px 16px 16px',
        background: '#fff', borderTop: '1px solid #f0ebe5',
        display: 'flex', gap: 12, zIndex: 100,
      }}>
        <button onClick={() => navigate(`/table/${table.code}`)} style={{
          flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #e8e0d8',
          background: '#fff', color: 'var(--text-primary-color)', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--admin-font)',
        }}>Thêm món</button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            flex: 1.5, padding: '14px', borderRadius: 14, border: 'none',
            background: 'var(--gd-button)', color: 'var(--text-primary-color)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--admin-font)',
            boxShadow: 'var(--drop-shadow)', opacity: submitting ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Send size={16} />
          {submitting ? 'Đang gửi...' : 'Gửi đơn hàng'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
