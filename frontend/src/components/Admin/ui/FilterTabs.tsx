
interface FilterTab {
  key: string;
  label: string;
}

interface Props {
  tabs: FilterTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

const FilterTabs = ({ tabs, activeKey, onChange }: Props) => {
  if (!tabs || tabs.length === 0) return null;
  const allTab = tabs[0];
  const selectTabs = tabs.slice(1);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      fontFamily: 'var(--admin-font)',
    }}>
      <button
        onClick={() => onChange(allTab.key)}
        style={{
          padding: '8px 20px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          border: '1.5px solid',
          borderColor: activeKey === allTab.key ? '#b45309' : '#e8e0d8',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          background: activeKey === allTab.key ? '#fef3c7' : '#fff',
          color: activeKey === allTab.key ? '#b45309' : '#64748b',
        }}
      >
        {allTab.label}
      </button>

      {selectTabs.length > 0 && (
        <select
          value={activeKey === allTab.key ? '' : activeKey}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
            else onChange(allTab.key);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            border: '1.5px solid #e8e0d8',
            color: activeKey !== allTab.key ? '#b45309' : '#475569',
            background: activeKey !== allTab.key ? '#fef3c7' : '#fff',
            outline: 'none',
            cursor: 'pointer',
            minWidth: 160,
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          <option value="" disabled>Lọc theo...</option>
          {selectTabs.map((tab) => (
            <option key={tab.key} value={tab.key}>{tab.label}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FilterTabs;
