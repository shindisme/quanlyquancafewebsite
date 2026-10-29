
import { Plus, Download } from 'lucide-react';
import SearchBar from '../../ui/SearchBar';

interface Props {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onExport?: () => void;
}

const PageHeader = ({
  title, subtitle, onAdd, addLabel = 'Thêm mới',
  searchValue, onSearchChange, searchPlaceholder = 'Tìm kiếm...',
  onExport,
}: Props) => (
  <div style={{ marginBottom: 24, fontFamily: 'var(--admin-font)' }}>
    {/* title + add buttons */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: onSearchChange ? 16 : 0,
    }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontWeight: 400 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onExport && (
          <button className="btn-secondary" onClick={onExport} style={{ gap: 6 }}>
            <Download size={16} />
            Xuất Excel
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              border: '1.5px solid #16a34a',
              background: '#fff',
              color: '#16a34a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            <Plus size={18} />
            {addLabel}
          </button>
        )}
      </div>
    </div>

    {/* Search bar */}
    {onSearchChange && (
      <div style={{ maxWidth: 400 }}>
        <SearchBar
          value={searchValue ?? ''}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          shortcutHint="/"
        />
      </div>
    )}
  </div>
);

export default PageHeader;
