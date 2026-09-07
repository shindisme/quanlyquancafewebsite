import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';
import SizeEditor from './AddSize';
import type { SizeRow } from './AddSize';
import productService from '../../../services/productService';

interface Category { id: string; name: string; }
interface Product { id: string; name: string; price: number; categoryId?: string; description?: string; image?: string; isAvailable?: boolean; sizes?: SizeRow[]; }

interface Props {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Product | null; categories: Category[];
}

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData, categories }: Props) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sizes, setSizes] = useState<SizeRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name); setCategoryId(initialData.categoryId ?? '');
      setPrice(String(initialData.price)); setDescription(initialData.description ?? '');
      setImage(initialData.image ?? ''); setIsActive(initialData.isAvailable ?? true);
      setSizes(initialData.sizes ?? []);
    } else {
      setName(''); setCategoryId(''); setPrice(''); setDescription('');
      setImage(''); setIsActive(true); setSizes([]);
    }
  }, [initialData, isOpen]);

  const handleImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setUploading(true); const res = await productService.uploadImage(file); setImage(res.url); toast.success('Tải ảnh thành công'); }
    catch { toast.error('Tải ảnh thất bại'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập tên sản phẩm'); return; }
    if (name.trim().length > 100) { toast.warning('Tên sản phẩm tối đa 100 ký tự'); return; }
    if (!categoryId) { toast.warning('Vui lòng chọn danh mục'); return; }
    if (!price || parseInt(price) <= 0) { toast.warning('Vui lòng nhập giá hợp lệ (> 0)'); return; }
    if (parseInt(price) > 10000000) { toast.warning('Giá sản phẩm tối đa 10.000.000đ'); return; }
    if (description && description.length > 500) { toast.warning('Mô tả tối đa 500 ký tự'); return; }
    const invalidSize = sizes.find(s => s.sizeName && s.extraPrice > 5000000);
    if (invalidSize) { toast.warning('Giá phụ size tối đa 5.000.000đ'); return; }
    try {
      setLoading(true);
      await onSubmit({
        name, categoryId, price: parseInt(price),
        description: description || undefined,
        image: image || undefined, isActive,
        sizes: sizes.filter((s) => s.sizeName),
      });
      onClose();
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'} size="lg">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="admin-label">Tên sản phẩm</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: Cà phê sữa đá" className="admin-input" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="admin-label">Danh mục</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="admin-select">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Giá gốc (đ)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} placeholder="25000" className="admin-input" />
          </div>
        </div>

        <div>
          <label className="admin-label">Mô tả</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn về sản phẩm..." className="admin-input" style={{ resize: 'none' }} />
        </div>

        <div>
          <label className="admin-label">Hình ảnh</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', border: '2px dashed #e2e8f0', borderRadius: 10,
              cursor: 'pointer', fontSize: 13, color: '#64748b', fontFamily: 'var(--admin-font)',
              transition: 'border-color 0.2s',
            }}>
              <ImagePlus size={16} />
              {uploading ? 'Đang tải...' : 'Chọn ảnh'}
              <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} disabled={uploading} />
            </label>
            {image && <img src={image} alt="preview" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' }} />}
          </div>
        </div>

        <SizeEditor sizes={sizes} onChange={setSizes} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: '#6366f1', width: 16, height: 16 }} />
          <label htmlFor="isActive" className="admin-label" style={{ marginBottom: 0 }}>Đang bán</label>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading || uploading}>{loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
