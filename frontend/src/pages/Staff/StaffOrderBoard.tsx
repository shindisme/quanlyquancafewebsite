/**
 * StaffOrderBoard — Kanban board quản lý đơn hàng (phiếu pha chế)
 *
 * TẠI SAO Kanban thay vì Table?
 * - Kanban cho phép nhìn tổng quan trạng thái ngay lập tức
 * - 1-click chuyển trạng thái thay vì mở modal → select → submit
 * - Phù hợp workflow cafe: Chờ → Đang làm → Xong
 *
 * HOẠT ĐỘNG:
 * - Fetch tất cả orders → group theo status → render 4 cột
 * - Auto refresh mỗi 15 giây (useAutoRefresh)
 * - Mỗi card có nút chuyển trạng thái kế tiếp
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Clock, CheckCircle, Coffee as CoffeeIcon, XCircle,
  ChevronRight, RefreshCw, Eye,
} from 'lucide-react';
import orderService, { type OrderStatus } from '../../services/orderService';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { ORDER_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface OrderItem {
  id: string;
  code: string;
  subTotal: number;
  status: OrderStatus;
  createdAt: string;
  invoice: {
    code: string;
    table: { name: string } | null;
  };
  orderDetails: {
    product: { name: string; image?: string };
    size?: { sizeName: string };
    quantity: number;
    price: number;
    orderDetailsToppings: { topping: { name: string } }[];
  }[];
}

const statusColumns: { key: OrderStatus; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'PENDING', label: 'Chờ xác nhận', icon: <Clock size={18} />, color: '#d97706', bg: '#fef3c7' },
  { key: 'CONFIRMED', label: 'Đang chuẩn bị', icon: <CoffeeIcon size={18} />, color: '#2563eb', bg: '#dbeafe' },
  { key: 'COMPLETED', label: 'Đã phục vụ', icon: <CheckCircle size={18} />, color: '#16a34a', bg: '#dcfce7' },
  { key: 'CANCELLED', label: 'Đã huỷ', icon: <XCircle size={18} />, color: '#dc2626', bg: '#fee2e2' },
];

const nextStatusMap: Record<string, OrderStatus | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'COMPLETED',
  COMPLETED: null,
  CANCELLED: null,
};

const StaffOrderBoard = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch {
      // silent — auto refresh will retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useAutoRefresh(fetchOrders, 15000);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Đã chuyển sang "${ORDER_STATUS[newStatus].label}"`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  // Group orders by status, chỉ lấy đơn hôm nay
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);

  const grouped = statusColumns.map(col => ({
    ...col,
    items: todayOrders.filter(o => o.status === col.key),
  }));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--admin-font)' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292018' }}>Quản lý Đơn hàng</h2>
          <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
            Hôm nay · {todayOrders.length} đơn
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10, border: '1px solid #e8e0d8',
            background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#57534e', fontFamily: 'var(--admin-font)',
          }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Kanban columns */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, height: 'calc(100vh - 200px)',
      }}>
        {grouped.map(col => (
          <div key={col.key} style={{
            display: 'flex', flexDirection: 'column',
            background: '#f8fafc', borderRadius: 14,
            border: '1.5px solid #e2e8f0', overflow: 'hidden',
          }}>
            {/* Column header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1.5px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: col.color }}>{col.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#292018' }}>{col.label}</span>
              </div>
              <span style={{
                padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: col.bg, color: col.color,
              }}>
                {col.items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="admin-scroll" style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
              {col.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#a8a29e', fontSize: 13 }}>
                  Không có đơn
                </div>
              ) : (
                col.items.map(order => {
                  const nextStatus = nextStatusMap[order.status];
                  return (
                    <div key={order.id} style={{
                      background: 'white', borderRadius: 10,
                      border: '1px solid #e8e0d8', padding: '12px 14px',
                      marginBottom: 8, transition: 'all 0.15s',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {/* Order code + table */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#292018' }}>{order.code}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: '#78716c',
                          padding: '2px 8px', background: '#f5f0eb', borderRadius: 6,
                        }}>
                          {order.invoice?.table?.name || 'Không rõ'}
                        </span>
                      </div>

                      {/* Items summary */}
                      <div style={{ fontSize: 12, color: '#78716c', marginBottom: 6, lineHeight: 1.5 }}>
                        {order.orderDetails.slice(0, 3).map((d, i) => (
                          <div key={i}>{d.quantity}x {d.product.name}{d.size ? ` (${d.size.sizeName})` : ''}</div>
                        ))}
                        {order.orderDetails.length > 3 && (
                          <div style={{ fontStyle: 'italic' }}>+{order.orderDetails.length - 3} món khác...</div>
                        )}
                      </div>

                      {/* Price + time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#b45309' }}>
                          {formatCurrency(order.subTotal)}
                        </span>
                        <span style={{ fontSize: 11, color: '#a8a29e' }}>
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailOrder(order); }}
                          style={{
                            flex: 1, padding: '6px', borderRadius: 6, border: '1px solid #e8e0d8',
                            background: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: '#57534e', fontFamily: 'var(--admin-font)',
                          }}
                        >
                          <Eye size={12} /> Chi tiết
                        </button>
                        {nextStatus && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, nextStatus); }}
                            style={{
                              flex: 1, padding: '6px', borderRadius: 6, border: 'none',
                              background: ORDER_STATUS[nextStatus].bg,
                              color: ORDER_STATUS[nextStatus].color,
                              cursor: 'pointer', fontWeight: 700, fontSize: 11,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                              fontFamily: 'var(--admin-font)',
                            }}
                          >
                            {ORDER_STATUS[nextStatus].label} <ChevronRight size={12} />
                          </button>
                        )}
                        {order.status === 'PENDING' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'CANCELLED'); }}
                            style={{
                              padding: '6px 10px', borderRadius: 6, border: 'none',
                              background: '#fee2e2', color: '#dc2626',
                              cursor: 'pointer', fontWeight: 700, fontSize: 11,
                              fontFamily: 'var(--admin-font)',
                            }}
                          >
                            Huỷ
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          }}
          onClick={() => setDetailOrder(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-scaleIn"
            style={{
              background: 'white', borderRadius: 20, padding: '28px 32px',
              width: 440, maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              fontFamily: 'var(--admin-font)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#292018' }}>Chi tiết đơn #{detailOrder.code}</h3>
              <button onClick={() => setDetailOrder(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e',
              }}>
                <XCircle size={22} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: '#78716c', marginBottom: 16 }}>
              <p><strong>Bàn:</strong> {detailOrder.invoice?.table?.name || 'Không rõ'}</p>
              <p><strong>Hoá đơn:</strong> {detailOrder.invoice?.code}</p>
              <p><strong>Thời gian:</strong> {formatDate(detailOrder.createdAt)}</p>
              <p>
                <strong>Trạng thái:</strong>{' '}
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: ORDER_STATUS[detailOrder.status].bg,
                  color: ORDER_STATUS[detailOrder.status].color,
                }}>
                  {ORDER_STATUS[detailOrder.status].label}
                </span>
              </p>
            </div>

            <div style={{ borderTop: '1px solid #f5f0eb', paddingTop: 12 }}>
              {detailOrder.orderDetails.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: i < detailOrder.orderDetails.length - 1 ? '1px solid #f5f0eb' : 'none',
                }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#292018' }}>
                      {d.quantity}x {d.product.name}
                    </span>
                    {d.size && <span style={{ fontSize: 12, color: '#78716c', marginLeft: 4 }}>({d.size.sizeName})</span>}
                    {d.orderDetailsToppings.length > 0 && (
                      <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>
                        + {d.orderDetailsToppings.map(t => t.topping.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#b45309' }}>
                    {formatCurrency(d.price * d.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '14px 0 0',
              borderTop: '2px solid #f5f0eb', marginTop: 8,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#292018' }}>Tổng</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>
                {formatCurrency(detailOrder.subTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrderBoard;
