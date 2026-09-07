import { Pencil, Trash2, Eye, HandPlatter } from 'lucide-react';
import type { Table } from './TableManage';

interface Props {
  data: Table[];
  onView: (item: Table) => void;
  onEdit: (item: Table) => void;
  onDelete: (item: Table) => void;
  onToggleBooked: (item: Table) => void;
}

const TableCardView = ({ data, onView, onEdit, onDelete, onToggleBooked }: Props) => {
  if (!data.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: '#94a3b8', fontFamily: 'var(--admin-font)',
      }}>
        <p style={{ fontSize: 15, fontWeight: 500 }}>Không có bàn nào</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 16,
    }}>
      {data.map((table) => (
        <div
          key={table.id}
          style={{
            background: '#fff',
            borderRadius: 16,
            border: `2px solid ${table.isBooked ? '#fecaca' : '#d1fae5'}`,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'var(--admin-font)',
            position: 'relative',
          }}
        >
          {/* Status badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
          }}>
            <button
              onClick={() => onToggleBooked(table)}
              style={{
                padding: '4px 10px', borderRadius: 12,
                fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--admin-font)',
                background: table.isBooked ? '#fef2f2' : '#ecfdf5',
                color: table.isBooked ? '#dc2626' : '#059669',
              }}
            >
              {table.isBooked ? 'Đang dùng' : 'Trống'}
            </button>
          </div>

          {/* Table icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: table.isBooked
              ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
              : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 8, marginBottom: 14,
          }}>
            <span style={{ fontSize: 28 }}><HandPlatter /></span>
          </div>

          {/* Table name */}
          <p style={{
            fontSize: 16, fontWeight: 700, color: '#0f172a',
            marginBottom: 4, textAlign: 'center',
          }}>
            {table.name}
          </p>

          {/* Area */}
          <p style={{
            fontSize: 12, color: '#94a3b8', marginBottom: 8,
          }}>
            {table.area?.name ?? '—'}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onView(table)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: '#f8fafc', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(table)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: '#eff6ff', color: '#3b82f6', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(table)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableCardView;
