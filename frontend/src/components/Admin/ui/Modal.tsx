import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = { sm: 400, md: 480, lg: 560, xl: 680 };

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: Props) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Content */}
      <div
        className="animate-scaleIn"
        style={{
          position: 'relative',
          width: '100%', maxWidth: sizeMap[size],
          maxHeight: '90vh',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'var(--admin-font)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: 'none', background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-scroll" style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
