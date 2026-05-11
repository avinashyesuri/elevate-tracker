import React from 'react';
import { THEME } from '../../constants/theme';

const EmptyState = React.memo(({ icon, title, description }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '48px 24px', textAlign: 'center', gap: '12px',
  }}>
    <span style={{ fontSize: '36px', opacity: 0.4 }}>{icon}</span>
    <h4 style={{ fontFamily: THEME.fontHeading, fontSize: '20px', color: THEME.textSecondary, fontWeight: 500 }}>{title}</h4>
    {description && <p style={{ fontSize: '13px', color: THEME.textMuted, maxWidth: '280px', lineHeight: 1.6 }}>{description}</p>}
  </div>
));

EmptyState.displayName = 'EmptyState';
export default EmptyState;
