import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btnBase: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 10,
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, fontFamily: 'var(--admin-font)',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 20 }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ ...btnBase, background: '#f1f5f9', color: '#64748b', opacity: currentPage === 1 ? 0.4 : 1 }}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...btnBase,
            background: p === currentPage ? '#6366f1' : 'transparent',
            color: p === currentPage ? 'white' : '#64748b',
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ ...btnBase, background: '#f1f5f9', color: '#64748b', opacity: currentPage === totalPages ? 0.4 : 1 }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
