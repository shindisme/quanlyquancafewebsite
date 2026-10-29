import { type ReactNode } from 'react';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, index: number) => ReactNode;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

const DataTable = <T extends { id?: string }>({
  data, columns, actions, emptyMessage
}: Props<T>) => {
  if (!data.length) return <EmptyState message={emptyMessage} />;

  const alignStyle = (a?: string): React.CSSProperties =>
    a === 'center' ? { textAlign: 'center' } : a === 'right' ? { textAlign: 'right' } : { textAlign: 'left' };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 0,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
    }}>
      <table
        className='table-fixed'
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: 'var(--admin-font)', borderRadius: 0 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <th style={{
              padding: '14px 20px', textAlign: 'left', width: 56,
              fontSize: 12, fontWeight: 700, color: 'var(--text-primary-color)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: '#fafbfc',
            }}>
              STT
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '14px 20px', ...alignStyle(col.align),
                  fontSize: 11, fontWeight: 700, color: 'var(--text-primary-color)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: '#fafbfc',
                  ...(col.width ? { width: col.width } : {}),
                }}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th style={{
                padding: '14px 20px', textAlign: 'right',
                fontSize: 11, fontWeight: 700, color: 'var(--text-primary-color)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: '#fafbfc', width: 120,
              }}>Chức năng</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={(item as any).id ?? idx}
              style={{
                borderBottom: idx < data.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <td style={{ padding: '14px 20px', color: '#cbd5e1', fontWeight: 600, fontSize: 13 }}>{idx + 1}</td>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '14px 20px', ...alignStyle(col.align), color: '#475569' }}>
                  {col.render ? col.render(item, idx) : (item as any)[col.key] ?? '—'}
                </td>
              ))}
              {actions && (
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    {actions(item)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
