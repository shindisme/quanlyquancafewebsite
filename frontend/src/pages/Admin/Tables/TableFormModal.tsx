import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';
import { Combobox, Spinner } from '../../../components/ui';

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

  const areaOptions = areas.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa bàn' : 'Thêm bàn'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="admin-label">Tên bàn</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vd: Bàn 01"
            className="admin-input"
            autoFocus
          />
        </div>
        <div>
          <Combobox
            label="Khu vực"
            options={areaOptions}
            value={areaId}
            onChange={(val) => setAreaId(String(val))}
            placeholder="-- Chọn khu vực --"
            searchPlaceholder="Tìm kiếm khu vực..."
          />
        </div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? <Spinner size="sm" color="white" text="Đang lưu..." /> : initialData ? 'Cập nhật' : 'Thêm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TableFormModal;
