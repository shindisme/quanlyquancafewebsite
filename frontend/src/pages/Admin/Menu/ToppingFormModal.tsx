import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';

interface Topping { id: string; name: string; price: number; categoryId?: string; }
interface Category { id: string; name: string; }

interface Props {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: { name: string; price: number; categoryId: string }) => Promise<void>;
  initialData?: Topping | null; categories: Category[];
}

const ToppingFormModal = ({ isOpen, onClose, onSubmit, initialData, categories }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initialData?.name ?? ''); setPrice(initialData?.price ? String(initialData.price) : '');
    setCategoryId(initialData?.categoryId ?? '');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập tên topping'); return; }
    if (name.trim().length > 50) { toast.warning('Tên topping tối đa 50 ký tự'); return; }
    if (!categoryId) { toast.warning('Vui lòng chọn danh mục'); return; }
    if (!price || parseInt(price) < 0) { toast.warning('Vui lòng nhập giá hợp lệ'); return; }
    if (parseInt(price) > 1000000) { toast.warning('Giá topping tối đa 1.000.000đ'); return; }
    try { setLoading(true); await onSubmit({ name, price: parseInt(price), categoryId }); onClose(); }
    catch { /* empty */ }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa topping' : 'Thêm topping'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="admin-label">Tên topping</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: Trân châu đen" className="admin-input" /></div>
        <div><label className="admin-label">Danh mục</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="admin-select"><option value="">-- Chọn --</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="admin-label">Giá (đ)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} placeholder="5000" className="admin-input" /></div>
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ToppingFormModal;
