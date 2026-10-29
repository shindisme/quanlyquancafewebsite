import React, { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: 'primary' | 'amber' | 'blue' | 'navy' | 'white' | 'gray' | 'current';
  thickness?: number;
  text?: string;
  textPosition?: 'bottom' | 'right';
  className?: string;
}

const SIZE_MAP = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 48,
};

const COLOR_MAP = {
  primary: 'var(--admin-primary, #16a34a)',
  amber: '#d97706',
  blue: '#0284c7',
  navy: '#0B3C60',
  white: '#ffffff',
  gray: '#94a3b8',
  current: 'currentColor',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  thickness = 2.5,
  text,
  textPosition = 'right',
  className = '',
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 24;
  const strokeColor = COLOR_MAP[color] || color;

  const spinnerSvg = (
    <svg
      style={{
        width: pixelSize,
        height: pixelSize,
        animation: 'spin 0.8s linear infinite',
      }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="loading"
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke={color === 'white' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)'}
        strokeWidth={thickness}
      />
      <path
        d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
        stroke={strokeColor}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );

  if (!text) return spinnerSvg;

  const isCol = textPosition === 'bottom';
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: isCol ? 'column' : 'row',
        alignItems: 'center',
        gap: isCol ? 8 : 10,
        fontFamily: 'var(--admin-font, sans-serif)',
      }}
    >
      {spinnerSvg}
      <span
        style={{
          fontSize: pixelSize < 24 ? 13 : 14,
          color: color === 'white' ? '#fff' : '#64748b',
          fontWeight: 500,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
 * 2. LOADING STATE (PAGE / SECTION REPLACEMENT)
 * ───────────────────────────────────────────────────────────── */
export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  minHeight?: number | string;
  color?: SpinnerProps['color'];
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Đang tải dữ liệu...',
  subMessage,
  size = 'lg',
  minHeight = 240,
  color = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`admin-loading-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '32px 16px',
        textAlign: 'center',
        fontFamily: 'var(--admin-font, sans-serif)',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(22, 163, 74, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
        }}
      >
        <Spinner size={size === 'sm' ? 24 : size === 'md' ? 28 : 34} color={color} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>
        {message}
      </p>
      {subMessage && (
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, margin: '4px 0 0 0' }}>
          {subMessage}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
 * 3. LOADING OVERLAY
 * ───────────────────────────────────────────────────────────── */
export interface LoadingOverlayProps {
  active: boolean;
  message?: string;
  subMessage?: string;
  blur?: boolean;
  fullScreen?: boolean;
  children?: ReactNode;
  color?: SpinnerProps['color'];
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  active,
  message = 'Đang xử lý...',
  subMessage,
  blur = true,
  fullScreen = false,
  children,
  color = 'primary',
}) => {
  if (!active && children) return <>{children}</>;
  if (!active) return null;

  const overlayContent = (
    <div
      style={{
        position: fullScreen ? 'fixed' : 'absolute',
        inset: 0,
        zIndex: fullScreen ? 9999 : 50,
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: blur ? 'blur(4px)' : 'none',
        WebkitBackdropFilter: blur ? 'blur(4px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 32px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 320,
          fontFamily: 'var(--admin-font, sans-serif)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        <Spinner size={36} color={color} />
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 14, margin: '14px 0 0 0' }}>
          {message}
        </p>
        {subMessage && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: '4px 0 0 0' }}>
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );

  if (fullScreen || !children) {
    return overlayContent;
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 60 }}>
      {children}
      {overlayContent}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
 * 4. SKELETON COMPONENT (MODERN SHIMMER PLACEHOLDER)
 * ───────────────────────────────────────────────────────────── */
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style,
}) => {
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: width || 40, height: height || 40, borderRadius: '50%' };
      case 'rectangular':
        return { width: width || '100%', height: height || 120, borderRadius: 10 };
      case 'card':
        return { width: width || '100%', height: height || 180, borderRadius: 14 };
      case 'text':
      default:
        return { width: width || '100%', height: height || 16, borderRadius: 6 };
    }
  };

  const dim = getDefaultDimensions();

  const baseStyle: React.CSSProperties = {
    display: 'block',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    width: dim.width,
    height: dim.height,
    borderRadius: dim.borderRadius,
    ...style,
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`admin-skeleton ${className}`}
          style={{
            ...baseStyle,
            marginBottom: count > 1 && i < count - 1 ? 10 : 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
        </div>
      ))}
    </>
  );
};

export default {
  Spinner,
  LoadingState,
  LoadingOverlay,
  Skeleton,
};
