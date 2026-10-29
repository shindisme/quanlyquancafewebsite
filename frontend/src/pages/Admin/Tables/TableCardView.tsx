import { Pencil, Trash2, Eye, HandPlatter } from 'lucide-react';
import type { Table } from './TableManage';
import { Badge, Tooltip } from '../../../components/ui';

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
            borderRadius: 12,
            border: `1.5px solid ${table.isBooked ? '#fecaca' : '#d1fae5'}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'var(--admin-font)',
            position: 'relative',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
        >
          {/* Status badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
          }}>
            <button
              onClick={() => onToggleBooked(table)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
              title="Nhấn để đổi trạng thái"
            >
              <Badge
                variant={table.isBooked ? 'danger' : 'success'}
                dot
                pulse={table.isBooked}
              >
                {table.isBooked ? 'Đang dùng' : 'Trống'}
              </Badge>
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
            fontSize: 12, color: '#94a3b8', marginBottom: 14,
          }}>
            {table.area?.name ?? '—'}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <Tooltip content="Xem chi tiết">
              <button
                onClick={() => onView(table)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: '#f8fafc', color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <Eye size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Chỉnh sửa">
              <button
                onClick={() => onEdit(table)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: '#eff6ff', color: '#3b82f6', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
              >
                <Pencil size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Xoá bàn">
              <button
                onClick={() => onDelete(table)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
              >
                <Trash2 size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableCardView;
