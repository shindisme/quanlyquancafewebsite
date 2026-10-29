import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';

export interface SearchBarOption {
  label: string;
  category?: string;
  value?: string;
}

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  clearable?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'pill';
  shortcutHint?: string; // e.g. "Ctrl+K" or "/"
  autoFocus?: boolean;
  disabled?: boolean;
  suggestions?: (string | SearchBarOption)[];
  onSelectSuggestion?: (suggestion: string | SearchBarOption) => void;
  filterComponent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm nhanh...',
  debounceMs = 0,
  clearable = true,
  loading = false,
  size = 'md',
  variant = 'default',
  shortcutHint,
  autoFocus = false,
  disabled = false,
  suggestions = [],
  onSelectSuggestion,
  filterComponent,
  className = '',
  style,
}) => {
  const [internalValue, setInternalValue] = useState(externalValue ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== internalValue) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Handle debounce if configured
  useEffect(() => {
    if (debounceMs <= 0) return;
    const handler = setTimeout(() => {
      if (onChange && internalValue !== externalValue) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs]);

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut (e.g. "/" or "Ctrl+K")
  useEffect(() => {
    if (!shortcutHint) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (shortcutHint === '/' && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (
        (shortcutHint.toLowerCase().includes('ctrl+k') || shortcutHint.toLowerCase().includes('cmd+k')) &&
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutHint]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (debounceMs <= 0 && onChange) {
      onChange(val);
    }
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) {
        onSearch(internalValue);
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (item: string | SearchBarOption) => {
    const val = typeof item === 'string' ? item : item.value || item.label;
    setInternalValue(val);
    if (onChange) onChange(val);
    if (onSelectSuggestion) onSelectSuggestion(item);
    if (onSearch) onSearch(val);
    setShowSuggestions(false);
  };

  // Dimensions & sizes
  const sizeStyles = {
    sm: { height: 34, fontSize: 13, iconSize: 14, paddingLeft: 32, paddingRight: 32 },
    md: { height: 40, fontSize: 14, iconSize: 16, paddingLeft: 38, paddingRight: 38 },
    lg: { height: 46, fontSize: 15, iconSize: 18, paddingLeft: 44, paddingRight: 44 },
  }[size];

  // Border radius by variant
  const borderRadius = variant === 'pill' ? 9999 : variant === 'filled' ? 10 : 10;

  return (
    <div
      ref={wrapperRef}
      className={`admin-searchbar-root ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--admin-font, sans-serif)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Search Icon */}
        <div
          style={{
            position: 'absolute',
            left: size === 'sm' ? 10 : size === 'md' ? 12 : 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFocused ? 'var(--admin-primary, #16a34a)' : '#94a3b8',
            pointerEvents: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          {loading ? (
            <Loader2 size={sizeStyles.iconSize} className="animate-spin text-amber-600" />
          ) : (
            <Search size={sizeStyles.iconSize} />
          )}
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            height: sizeStyles.height,
            fontSize: sizeStyles.fontSize,
            fontFamily: 'inherit',
            paddingLeft: sizeStyles.paddingLeft,
            paddingRight: internalValue && clearable ? sizeStyles.paddingRight : 12,
            borderRadius,
            border: `1.5px solid ${isFocused ? 'var(--admin-primary, #16a34a)' : '#e2e8f0'}`,
            background: variant === 'filled' ? '#f8fafc' : '#ffffff',
            color: '#0f172a',
            outline: 'none',
            boxShadow: isFocused
              ? '0 0 0 3px var(--admin-primary-light, rgba(22, 163, 74, 0.12)), 0 2px 6px rgba(0,0,0,0.05)'
              : '0 1px 2px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.2s ease',
          }}
        />

        {/* Action icons right (Clear button or Shortcut hint) */}
        <div
          style={{
            position: 'absolute',
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {clearable && internalValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 20,
                height: 20,
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
              }}
              title="Xoá tìm kiếm"
            >
              <X size={12} />
            </button>
          )}

          {!internalValue && shortcutHint && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 4,
                background: '#f1f5f9',
                color: '#94a3b8',
                border: '1px solid #e2e8f0',
                pointerEvents: 'none',
              }}
            >
              {shortcutHint}
            </span>
          )}
        </div>
      </div>

      {/* Optional attached Filter Component */}
      {filterComponent && (
        <div style={{ flexShrink: 0 }}>
          {filterComponent}
        </div>
      )}

      {/* Suggestions Popover */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: filterComponent ? 'auto' : 0,
            minWidth: 260,
            maxWidth: '100%',
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
            zIndex: 90,
            padding: 6,
            animation: 'slideDown 0.15s ease-out',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
            }}
          >
            Gợi ý tìm kiếm
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {suggestions.map((item, idx) => {
              const label = typeof item === 'string' ? item : item.label;
              const category = typeof item !== 'string' ? item.category : undefined;

              return (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = 'var(--admin-primary, #16a34a)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Search size={13} style={{ color: '#94a3b8' }} />
                    <span>{label}</span>
                  </div>
                  {category && (
                    <span
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {category}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
