import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';

interface Area { id: string; name: string; }

interface Props {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
  initialData?: Area | null;
}

const AreaFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setName(initialData?.name ?? ''); }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập tên khu vực'); return; }
    try { setLoading(true); await onSubmit({ name: name.trim() }); onClose(); }
    catch { /* empty */ }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa khu vực' : 'Thêm khu vực'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="admin-label">Tên khu vực</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: Tầng 1, Tầng 2..." className="admin-input" autoFocus /></div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AreaFormModal;
