import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';

interface Area { id: string; name: string; }
interface Table { id: string; name: string; areaId?: string; }

interface Props {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: { name: string; areaId: string }) => Promise<void>;
  initialData?: Table | null; areas: Area[];
}

const TableFormModal = ({ isOpen, onClose, onSubmit, initialData, areas }: Props) => {
  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setName(initialData?.name ?? ''); setAreaId(initialData?.areaId ?? ''); }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập tên bàn'); return; }
    if (!areaId) { toast.warning('Vui lòng chọn khu vực'); return; }
    try { setLoading(true); await onSubmit({ name: name.trim(), areaId }); onClose(); }
    catch { /* */ }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa bàn' : 'Thêm bàn'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="admin-label">Tên bàn</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: Bàn 01" className="admin-input" autoFocus /></div>
        <div><label className="admin-label">Khu vực</label><select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="admin-select"><option value="">-- Chọn khu vực --</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default TableFormModal;
