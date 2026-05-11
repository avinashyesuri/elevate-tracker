import React, { useState } from 'react';
import { THEME } from '../../constants/theme';

const Button = React.memo(({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, ...props }) => {
  const [hovered, setHovered] = useState(false);

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', borderRadius: THEME.radiusSm,
    fontFamily: THEME.fontBody, fontWeight: 500, transition: THEME.transition,
    opacity: disabled ? 0.4 : 1, whiteSpace: 'nowrap',
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '9px 18px', fontSize: '13px' },
    lg: { padding: '12px 24px', fontSize: '14px' },
  };

  const variants = {
    primary: {
      background: hovered ? '#D8FF45' : THEME.accent,
      color: '#060606',
      boxShadow: hovered ? '0 0 20px rgba(200,245,53,0.3)' : 'none',
    },
    secondary: {
      background: hovered ? THEME.bgCardHover : THEME.bgCard,
      color: THEME.textPrimary,
      border: `1px solid ${hovered ? THEME.borderHover : THEME.border}`,
    },
    ghost: {
      background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
      color: hovered ? THEME.textPrimary : THEME.textSecondary,
      border: `1px solid ${hovered ? THEME.border : 'transparent'}`,
    },
    danger: {
      background: hovered ? 'rgba(255,68,68,0.2)' : 'rgba(255,68,68,0.08)',
      color: THEME.red,
      border: `1px solid rgba(255,68,68,${hovered ? '0.4' : '0.2'})`,
    },
    accent: {
      background: hovered ? THEME.accentGlow : 'transparent',
      color: THEME.accent,
      border: `1px solid ${hovered ? THEME.borderAccent : 'rgba(200,245,53,0.2)'}`,
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
