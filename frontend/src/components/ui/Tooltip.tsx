import React, { useState, useRef, type ReactNode } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!content || disabled) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  };

  const getPositionStyles = (): { popover: React.CSSProperties; arrow: React.CSSProperties } => {
    switch (position) {
      case 'bottom':
        return {
          popover: {
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
          },
          arrow: {
            top: -4,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
          },
        };
      case 'left':
        return {
          popover: {
            top: '50%',
            right: 'calc(100% + 8px)',
            transform: 'translateY(-50%)',
          },
          arrow: {
            right: -4,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
          },
        };
      case 'right':
        return {
          popover: {
            top: '50%',
            left: 'calc(100% + 8px)',
            transform: 'translateY(-50%)',
          },
          arrow: {
            left: -4,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
          },
        };
      case 'top':
      default:
        return {
          popover: {
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
          },
          arrow: {
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
          },
        };
    }
  };

  const { popover, arrow } = getPositionStyles();

  return (
    <div
      className={`admin-tooltip-container ${className}`}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'var(--admin-font, sans-serif)',
            padding: '5px 10px',
            borderRadius: 6,
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease-out',
            ...popover,
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              backgroundColor: '#0f172a',
              ...arrow,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
