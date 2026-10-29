import React, { useState, useRef, useEffect, useId, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string | number> {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T, option?: SelectOption<T>) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const Select = <T extends string | number,>({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn một giá trị...',
  label,
  helperText,
  error,
  disabled = false,
  size = 'md',
  fullWidth = true,
  className = '',
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 13, minHeight: 34 },
    md: { padding: '9px 14px', fontSize: 14, minHeight: 40 },
    lg: { padding: '12px 16px', fontSize: 15, minHeight: 46 },
  }[size];

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value, option);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`admin-select-custom ${className}`}
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        display: fullWidth ? 'block' : 'inline-block',
        fontFamily: 'var(--admin-font, sans-serif)',
      }}
    >
      {label && (
        <label
          htmlFor={uniqueId}
          className="admin-label"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: error ? '#dc2626' : 'var(--admin-text, #1e293b)',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={uniqueId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: disabled ? '#f8fafc' : '#ffffff',
          border: `1.5px solid ${error ? '#ef4444' : isOpen ? 'var(--admin-primary, #16a34a)' : '#e2e8f0'}`,
          borderRadius: 10,
          color: selectedOption ? '#0f172a' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen
            ? '0 0 0 3px var(--admin-primary-light, rgba(22, 163, 74, 0.12)), 0 2px 6px rgba(0,0,0,0.05)'
            : '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          gap: 10,
          ...sizeStyles,
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {selectedOption.label}
              </span>
            </>
          ) : (
            placeholder
          )}
        </span>

        <ChevronDown
          size={16}
          style={{
            color: '#64748b',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04)',
            padding: '4px',
            maxHeight: 240,
            overflowY: 'auto',
            animation: 'slideDown 0.15s ease-out',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: isSelected ? 600 : 400,
                  color: option.disabled
                    ? '#cbd5e1'
                    : isSelected
                    ? 'var(--admin-primary, #16a34a)'
                    : '#334155',
                  background: isSelected ? 'rgba(22, 163, 74, 0.08)' : 'transparent',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!option.disabled && !isSelected) {
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!option.disabled && !isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {option.badge && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check size={15} style={{ color: 'var(--admin-primary, #16a34a)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error ? (
        <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4, margin: '4px 0 0 0' }}>
          {error}
        </p>
      ) : helperText ? (
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, margin: '4px 0 0 0' }}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Select;
