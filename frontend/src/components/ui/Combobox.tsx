import React, { useState, useRef, useEffect, useId } from 'react';
import { Check, ChevronDown, X, Search, Loader2 } from 'lucide-react';
import { matchVietnamese } from '../../utils/textUtils';

export interface ComboboxOption<T = any> {
  value: string | number;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
  data?: T;
}

export interface ComboboxProps<T = any> {
  options: ComboboxOption<T>[];
  value?: string | number | (string | number)[];
  onChange: (value: any, selectedOption?: ComboboxOption<T> | ComboboxOption<T>[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dropdownMaxHeight?: number;
  renderOption?: (option: ComboboxOption<T>, isSelected: boolean) => React.ReactNode;
}

export const Combobox = <T,>({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  searchPlaceholder = 'Tìm kiếm lựa chọn...',
  label,
  helperText,
  error,
  disabled = false,
  clearable = true,
  multiple = false,
  loading = false,
  emptyMessage = 'Không tìm thấy kết quả nào',
  size = 'md',
  className = '',
  dropdownMaxHeight = 240,
  renderOption,
}: ComboboxProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uniqueId = useId();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options with Vietnamese tone support
  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    return matchVietnamese(opt.label, search) || (opt.subLabel && matchVietnamese(opt.subLabel, search));
  });

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      const item = items[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const isSelected = (val: string | number) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (option: ComboboxOption<T>) => {
    if (option.disabled) return;

    if (multiple) {
      const currentArr = Array.isArray(value) ? [...value] : [];
      const exists = currentArr.includes(option.value);
      const nextArr = exists
        ? currentArr.filter((v) => v !== option.value)
        : [...currentArr, option.value];
      
      const selectedOpts = options.filter((opt) => nextArr.includes(opt.value));
      onChange(nextArr, selectedOpts);
    } else {
      onChange(option.value, option);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '', multiple ? [] : undefined);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Label display logic
  const getSelectedLabel = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return null;
      if (value.length === 1) {
        const found = options.find((o) => o.value === value[0]);
        return found ? found.label : value[0];
      }
      return `Đã chọn (${value.length})`;
    }

    const found = options.find((o) => o.value === value);
    return found ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {found.icon}
        {found.label}
      </span>
    ) : null;
  };

  const selectedDisplay = getSelectedLabel();
  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== '' && value !== null;

  const sizeStyles = {
    sm: { padding: '6px 10px', fontSize: 13, minHeight: 34 },
    md: { padding: '9px 12px', fontSize: 14, minHeight: 40 },
    lg: { padding: '12px 16px', fontSize: 15, minHeight: 46 },
  }[size];

  return (
    <div
      ref={containerRef}
      className={`admin-combobox-root ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'var(--admin-font, sans-serif)',
      }}
      onKeyDown={handleKeyDown}
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

      {/* Main trigger button */}
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
          color: hasValue ? 'var(--admin-text, #0f172a)' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen
            ? '0 0 0 3px var(--admin-primary-light, rgba(22, 163, 74, 0.12)), 0 4px 12px rgba(0,0,0,0.06)'
            : '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          textAlign: 'left',
          ...sizeStyles,
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {selectedDisplay || placeholder}
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          {clearable && hasValue && !disabled && (
            <span
              onClick={handleClear}
              role="button"
              tabIndex={-1}
              style={{
                color: '#94a3b8',
                padding: 2,
                borderRadius: '50%',
                display: 'inline-flex',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              title="Xoá chọn"
            >
              <X size={14} />
            </span>
          )}

          {loading ? (
            <Loader2 size={16} className="animate-spin text-amber-600" />
          ) : (
            <ChevronDown
              size={16}
              style={{
                color: '#64748b',
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          )}
        </span>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            animation: 'slideDown 0.15s ease-out',
          }}
        >
          {/* Search box inside dropdown */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 18,
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: 13,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                outline: 'none',
                background: '#ffffff',
                color: '#0f172a',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--admin-primary, #16a34a)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 18,
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* List of options */}
          <ul
            ref={listRef}
            role="listbox"
            style={{
              maxHeight: dropdownMaxHeight,
              overflowY: 'auto',
              margin: 0,
              padding: '4px',
              listStyle: 'none',
            }}
          >
            {filteredOptions.length === 0 ? (
              <li
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((option, idx) => {
                const selected = isSelected(option.value);
                const isHighlighted = idx === highlightedIndex;

                if (renderOption) {
                  return (
                    <li
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      role="option"
                      aria-selected={selected}
                    >
                      {renderOption(option, selected)}
                    </li>
                  );
                }

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: selected ? 600 : 400,
                      color: option.disabled
                        ? '#cbd5e1'
                        : selected
                        ? 'var(--admin-primary, #16a34a)'
                        : '#334155',
                      background: isHighlighted
                        ? 'rgba(22, 163, 74, 0.08)'
                        : selected
                        ? 'rgba(22, 163, 74, 0.04)'
                        : 'transparent',
                      cursor: option.disabled ? 'not-allowed' : 'pointer',
                      transition: 'background 0.1s ease',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      {option.icon && (
                        <span style={{ flexShrink: 0, color: '#64748b' }}>
                          {option.icon}
                        </span>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{option.label}</span>
                        {option.subLabel && (
                          <span
                            style={{
                              fontSize: 11.5,
                              color: '#94a3b8',
                              marginTop: 1,
                            }}
                          >
                            {option.subLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {option.badge && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: option.badgeColor || '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {option.badge}
                        </span>
                      )}
                      {selected && (
                        <Check
                          size={15}
                          style={{
                            color: 'var(--admin-primary, #16a34a)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Error or helper text */}
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

export default Combobox;
