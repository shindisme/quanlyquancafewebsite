import { Plus, Trash2 } from 'lucide-react';

export interface SizeRow { sizeName: string; extraPrice: number; }

interface Props { sizes: SizeRow[]; onChange: (sizes: SizeRow[]) => void; }

const SizeEditor = ({ sizes, onChange }: Props) => {
  const add = () => onChange([...sizes, { sizeName: '', extraPrice: 0 }]);
  const remove = (i: number) => onChange(sizes.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof SizeRow, value: string | number) => {
    onChange(sizes.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  return (
    <div style={{ fontFamily: 'var(--admin-font)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <label className="admin-label" style={{ marginBottom: 0 }}>Kích cỡ (Size)</label>
        <button type="button" onClick={add} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontWeight: 600, color: '#6366f1',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--admin-font)',
        }}>
          <Plus size={13} /> Thêm size
        </button>
      </div>

      {sizes.length === 0 && (
        <p style={{ fontSize: 13, color: '#94a3b8', padding: '8px 0' }}>Chưa có size nào.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sizes.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="text" value={s.sizeName} onChange={(e) => update(i, 'sizeName', e.target.value)} placeholder="Tên size" className="admin-input" style={{ flex: 1 }} />
            <input type="number" value={s.extraPrice} min={0} onChange={(e) => update(i, 'extraPrice', parseInt(e.target.value) || 0)} placeholder="Giá thêm" className="admin-input" style={{ width: 120 }} />
            <button type="button" onClick={() => remove(i)} style={{
              width: 36, height: 36, borderRadius: 8, border: 'none',
              background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeEditor;
