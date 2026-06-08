/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Modal from '../../../components/Admin/ui/Modal';
import StatusBadge from '../../../components/Admin/ui/StatusBadge';
import orderService from '../../../services/orderService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const OrderDetailModal = ({ isOpen, onClose, orderId }: Props) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      orderService.getById(orderId)
        .then(setOrder)
        .finally(() => setLoading(false));
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết đơn hàng" size="xl">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : order ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-slate-800 font-mono">{order.code}</p>
              <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-100 pt-3">
            <div><span className="text-slate-400">Bàn:</span> <span className="font-medium">{order.table?.name ?? 'Mang về'}</span></div>
            <div><span className="text-slate-400">Nhân viên:</span> <span className="font-medium">{order.user?.name ?? '—'}</span></div>
            {order.coupon && <div className="col-span-2"><span className="text-slate-400">Coupon:</span> <span className="font-medium">{order.coupon.code}</span></div>}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm font-semibold text-slate-700 mb-2">Danh sách món</p>
            <div className="flex flex-col gap-2">
              {order.orderDetails?.map((d: any, i: number) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{d.product?.name}</p>
                    {d.size && <p className="text-xs text-slate-400">Size: {d.size.sizeName}</p>}
                    {d.orderDetailsToppings?.length > 0 && (
                      <p className="text-xs text-slate-400">
                        Topping: {d.orderDetailsToppings.map((t: any) => t.topping?.name).join(', ')}
                      </p>
                    )}
                    {d.note && <p className="text-xs text-orange-400">Ghi chú: {d.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">x{d.quantity}</p>
                    <p className="font-semibold text-slate-800">{(d.price * d.quantity).toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-700">Tổng cộng</span>
            <span className="text-xl font-bold text-orange-500">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8">Không tìm thấy đơn hàng</p>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
