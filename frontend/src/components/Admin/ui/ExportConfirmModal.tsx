import Modal from './Modal';
import { FileSpreadsheet } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

const ExportConfirmModal = ({ isOpen, onClose, onConfirm, count }: Props) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Xuất Excel" size="sm">
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg, #059669, #10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
      }}>
        <FileSpreadsheet size={28} color="white" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', fontFamily: 'var(--admin-font)', marginBottom: 8 }}>
        Bạn có muốn xuất file Excel?
      </p>
      <p style={{ fontSize: 13, color: '#64748b', fontFamily: 'var(--admin-font)' }}>
        Sẽ xuất <strong>{count}</strong> bản ghi ra file .xlsx
      </p>
    </div>
    <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
      <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
      <button
        type="button"
        className="btn-primary"
        style={{ flex: 1, background: '#059669' }}
        onClick={() => { onConfirm(); onClose(); }}
      >
        Xuất Excel
      </button>
    </div>
  </Modal>
);

export default ExportConfirmModal;
