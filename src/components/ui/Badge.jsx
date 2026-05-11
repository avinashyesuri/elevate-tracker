import React from 'react';
import { THEME } from '../../constants/theme';

const Badge = React.memo(({ children, color, bg, border, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
    borderRadius: '4px', fontSize: '10px', fontFamily: THEME.fontMono,
    fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: color || THEME.accent, background: bg || THEME.accentMuted,
    border: `1px solid ${border || THEME.borderAccent}`,
    whiteSpace: 'nowrap',
    ...style,
  }}>
    {children}
  </span>
));

Badge.displayName = 'Badge';
export default Badge;
