import { useState, useEffect, type FormEvent } from 'react';
import Modal from '../../../components/Admin/ui/Modal';
import type { OrderStatus } from '../../../services/orderService';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Chờ xác nhận' }, { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' }, { value: 'CANCELLED', label: 'Đã huỷ' },
];

interface Props {
  isOpen: boolean; onClose: () => void;
  order: { id: string; code: string; status: string } | null;
  onSubmit: (id: string, status: OrderStatus) => Promise<void>;
}

const OrderStatusModal = ({ isOpen, onClose, order, onSubmit }: Props) => {
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (order) setStatus(order.status as OrderStatus); }, [order, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!order) return;
    try { setLoading(true); await onSubmit(order.id, status); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật trạng thái" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--admin-font)' }}>
        <p style={{ fontSize: 14, color: '#64748b' }}>Đơn hàng: <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{order?.code}</span></p>
        <div><label className="admin-label">Trạng thái mới</label><select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="admin-select">{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Đang lưu...' : 'Cập nhật'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderStatusModal;
