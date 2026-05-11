import React from 'react';
import { THEME } from '../../constants/theme';

const ProgressBar = React.memo(({ value = 0, color, height = 4, style = {} }) => (
  <div style={{ width: '100%', height, background: THEME.border, borderRadius: height, overflow: 'hidden', ...style }}>
    <div style={{
      height: '100%', width: `${Math.min(100, Math.max(0, value))}%`,
      background: color || THEME.accent, borderRadius: height,
      transition: 'width 0.6s ease',
    }} />
  </div>
));

ProgressBar.displayName = 'ProgressBar';
export default ProgressBar;
