import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'neutral'
  | 'amber';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  pill?: boolean;
  icon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_CONFIGS: Record<
  BadgeVariant,
  { bg: string; text: string; border: string; dot: string }
> = {
  primary: {
    bg: '#ecfdf5',
    text: '#059669',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  success: {
    bg: '#ecfdf5',
    text: '#059669',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  warning: {
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  amber: {
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
    dot: '#f97316',
  },
  danger: {
    bg: '#fef2f2',
    text: '#dc2626',
    border: '#fecaca',
    dot: '#ef4444',
  },
  info: {
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
    dot: '#3b82f6',
  },
  purple: {
    bg: '#faf5ff',
    text: '#7e22ce',
    border: '#e9d5ff',
    dot: '#a855f7',
  },
  neutral: {
    bg: '#f8fafc',
    text: '#475569',
    border: '#e2e8f0',
    dot: '#94a3b8',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  pulse = false,
  pill = true,
  icon,
  removable = false,
  onRemove,
  className = '',
  style,
}) => {
  const conf = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.neutral;

  const sizeStyles = {
    xs: { padding: '2px 6px', fontSize: 11, gap: 4 },
    sm: { padding: '3px 9px', fontSize: 12, gap: 6 },
    md: { padding: '5px 12px', fontSize: 13, gap: 7 },
  }[size];

  return (
    <span
      className={`admin-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--admin-font, sans-serif)',
        fontWeight: 600,
        borderRadius: pill ? 9999 : 6,
        backgroundColor: conf.bg,
        color: conf.text,
        border: `1px solid ${conf.border}`,
        lineHeight: 1.2,
        ...sizeStyles,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: size === 'xs' ? 5 : 6,
            height: size === 'xs' ? 5 : 6,
          }}
        >
          {pulse && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: conf.dot,
                opacity: 0.75,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
          )}
          <span
            style={{
              position: 'relative',
              borderRadius: '50%',
              width: '100%',
              height: '100%',
              backgroundColor: conf.dot,
            }}
          />
        </span>
      )}

      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}

      <span>{children}</span>

      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            marginLeft: 2,
            opacity: 0.7,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          title="Gỡ bỏ"
        >
          <X size={size === 'xs' ? 10 : 12} />
        </button>
      )}
    </span>
  );
};

export const StatusDot: React.FC<{
  variant?: BadgeVariant;
  pulse?: boolean;
  size?: number;
}> = ({ variant = 'success', pulse = false, size = 8 }) => {
  const conf = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.success;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
      }}
    >
      {pulse && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: conf.dot,
            opacity: 0.75,
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}
      <span
        style={{
          position: 'relative',
          borderRadius: '50%',
          width: '100%',
          height: '100%',
          backgroundColor: conf.dot,
        }}
      />
    </span>
  );
};

export default Badge;
