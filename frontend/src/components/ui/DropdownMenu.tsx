import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

export type DropdownPlacement = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface DropdownMenuItem {
  key?: string;
  label?: ReactNode;
  icon?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  danger?: boolean;
  disabled?: boolean;
  badge?: string | number;
  badgeColor?: string;
  subText?: string;
  shortcut?: string;
  divider?: boolean;
  header?: boolean;
}

export interface DropdownMenuProps {
  trigger?: ReactNode;
  items?: DropdownMenuItem[];
  children?: ReactNode;
  placement?: DropdownPlacement;
  width?: number | string;
  disabled?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  children,
  placement = 'bottom-right',
  width = 200,
  disabled = false,
  className = '',
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    onOpenChange?.(nextState);
  };

  const handleItemClick = (item: DropdownMenuItem, e: React.MouseEvent) => {
    if (item.disabled) return;
    item.onClick?.(e);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  // Placement coordinates
  const getPlacementStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 100,
      width,
    };

    switch (placement) {
      case 'bottom-left':
        return { ...base, top: 'calc(100% + 6px)', left: 0 };
      case 'top-left':
        return { ...base, bottom: 'calc(100% + 6px)', left: 0 };
      case 'top-right':
        return { ...base, bottom: 'calc(100% + 6px)', right: 0 };
      case 'bottom-right':
      default:
        return { ...base, top: 'calc(100% + 6px)', right: 0 };
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`admin-dropdown-menu ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'var(--admin-font, sans-serif)',
      }}
    >
      {/* Trigger */}
      <div onClick={toggleOpen} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          style={{
            ...getPlacementStyles(),
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.04)',
            padding: '4px',
            animation: 'scaleIn 0.15s ease-out',
          }}
        >
          {items ? (
            items.map((item, idx) => {
              if (item.divider) {
                return (
                  <div
                    key={idx}
                    style={{
                      height: 1,
                      backgroundColor: '#f1f5f9',
                      margin: '4px 0',
                    }}
                  />
                );
              }

              if (item.header) {
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#94a3b8',
                    }}
                  >
                    {item.label}
                  </div>
                );
              }

              const isDanger = item.danger;

              return (
                <button
                  key={item.key || idx}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={(e) => handleItemClick(item, e)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    border: 'none',
                    textAlign: 'left',
                    background: 'transparent',
                    color: item.disabled
                      ? '#cbd5e1'
                      : isDanger
                      ? '#dc2626'
                      : '#334155',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    gap: 10,
                  }}
                  onMouseEnter={(e) => {
                    if (item.disabled) return;
                    e.currentTarget.style.background = isDanger ? '#fee2e2' : '#f8fafc';
                    if (!isDanger) e.currentTarget.style.color = '#0f172a';
                  }}
                  onMouseLeave={(e) => {
                    if (item.disabled) return;
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isDanger ? '#dc2626' : '#334155';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    {item.icon && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: isDanger ? '#dc2626' : '#64748b',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </span>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{item.label}</span>
                      {item.subText && (
                        <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                          {item.subText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.badge !== undefined && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 6,
                          background: item.badgeColor || '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
