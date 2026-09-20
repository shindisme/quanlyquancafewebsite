import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../components/Admin/ui/Modal';
import type { ToppingItem } from '../../../services/toppingService';
import type { ToppingGroup } from '../../../services/toppingGroupService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; toppingIds: string[] }) => Promise<void>;
  initialData?: ToppingGroup | null;
  allToppings: ToppingItem[];
}

const ToppingGroupFormModal = ({ isOpen, onClose, onSubmit, initialData, allToppings }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setDescription(initialData.description ?? '');
      setSelectedToppingIds(initialData.toppings?.map((t) => t.id) ?? []);
    } else {
      setName('');
      setDescription('');
      setSelectedToppingIds([]);
    }
  }, [initialData, isOpen]);

  const toggleTopping = (toppingId: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Vui lòng nhập tên nhóm'); return; }
    if (name.trim().length > 100) { toast.warning('Tên nhóm tối đa 100 ký tự'); return; }
    if (description && description.length > 255) { toast.warning('Mô tả tối đa 255 ký tự'); return; }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        toppingIds: selectedToppingIds,
      });
      onClose();
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Chỉnh sửa nhóm topping' : 'Thêm nhóm topping'} size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="admin-label">Tên nhóm topping</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vd: Topping Trà Sữa"
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">Mô tả nhóm</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vd: Dành cho các món trà sữa..."
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">Chọn các Topping trong nhóm này</label>
          <div
            style={{
              maxHeight: 180,
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 8,
              background: '#f8fafc',
            }}
          >
            {allToppings.length === 0 ? (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Chưa có topping nào</span>
            ) : (
              allToppings.map((t) => {
                const checked = selectedToppingIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#334155',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: checked ? '#fef3c7' : '#fff',
                      border: checked ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopping(t.id)}
                      style={{ accentColor: '#b45309', width: 15, height: 15 }}
                    />
                    <span style={{ fontWeight: checked ? 600 : 400 }}>{t.name}</span>
                  </label>
                );
              })
            )}
          </div>
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

export default ToppingGroupFormModal;
