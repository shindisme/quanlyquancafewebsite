import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName, loading }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xoá" size="sm">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 16, padding: '8px 0',
        fontFamily: 'var(--admin-font)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={28} color="#ef4444" />
        </div>
        <div>
          <p style={{ fontSize: 15, color: '#475569', fontWeight: 500 }}>Bạn có chắc muốn xoá</p>
          <p style={{ fontSize: 16, color: '#0f172a', fontWeight: 700, marginTop: 4 }}>"{itemName}"?</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>Hành động này không thể hoàn tác.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button className="btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xoá...' : 'Xoá'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
