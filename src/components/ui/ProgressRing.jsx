import React from 'react';
import { THEME } from '../../constants/theme';

const ProgressRing = React.memo(({ value = 0, size = 120, strokeWidth = 8, label, sublabel }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={THEME.border} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={value >= 100 ? THEME.accent : value >= 50 ? THEME.accentDim : THEME.textMuted}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '2px',
      }}>
        {label && <span style={{ fontSize: size * 0.2, fontFamily: THEME.fontMono, fontWeight: 600, color: THEME.textPrimary, lineHeight: 1 }}>{label}</span>}
        {sublabel && <span style={{ fontSize: size * 0.1, fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{sublabel}</span>}
      </div>
    </div>
  );
});

ProgressRing.displayName = 'ProgressRing';
export default ProgressRing;
