import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';
import type { ToppingGroup } from '../../../services/toppingGroupService';

interface Topping {
  id: string;
  name: string;
  price: number;
  isActive?: boolean;
  groups?: { id: string; name: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; price: number; isActive?: boolean; groupIds: string[] }) => Promise<void>;
  initialData?: Topping | null;
  toppingGroups: ToppingGroup[];
}

const ToppingFormModal = ({ isOpen, onClose, onSubmit, initialData, toppingGroups }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setPrice(initialData.price ? String(initialData.price) : '');
      setIsActive(initialData.isActive ?? true);
      setSelectedGroupIds(initialData.groups?.map((g) => g.id) ?? []);
    } else {
      setName('');
      setPrice('');
      setIsActive(true);
      setSelectedGroupIds([]);
    }
  }, [initialData, isOpen]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập tên topping'); return; }
    if (name.trim().length > 50) { toast.warning('Tên topping tối đa 50 ký tự'); return; }
    if (!price || parseInt(price) < 0) { toast.warning('Vui lòng nhập giá hợp lệ'); return; }
    if (parseInt(price) > 1000000) { toast.warning('Giá topping tối đa 1.000.000đ'); return; }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        price: parseInt(price),
        isActive,
        groupIds: selectedGroupIds,
      });
      onClose();
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa topping' : 'Thêm topping'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="admin-label">Tên topping</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vd: Trân châu đen"
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">Giá (đ)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
            placeholder="5000"
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">Thuộc Nhóm Topping (Có thể chọn nhiều nhóm)</label>
          <div
            style={{
              maxHeight: 140,
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: '#f8fafc',
            }}
          >
            {toppingGroups.length === 0 ? (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Chưa có nhóm topping nào</span>
            ) : (
              toppingGroups.map((g) => {
                const checked = selectedGroupIds.includes(g.id);
                return (
                  <label
                    key={g.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGroup(g.id)}
                      style={{ accentColor: '#b45309', width: 15, height: 15 }}
                    />
                    <span>{g.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="toppingActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#b45309' }}
          />
          <label htmlFor="toppingActive" style={{ fontSize: 14, color: '#334155', cursor: 'pointer' }}>
            Đang phục vụ (Còn hàng)
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ToppingFormModal;
