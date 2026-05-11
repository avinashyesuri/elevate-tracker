import React from 'react';
import { THEME } from '../../constants/theme';

const HeaderBar = React.memo(({ progress = 0 }) => (
  <div style={{ position: 'fixed', top: 0, left: '240px', right: 0, height: '3px', zIndex: 50 }}>
    <div style={{
      height: '100%', width: `${progress}%`, background: THEME.accent,
      boxShadow: '0 0 8px rgba(200,245,53,0.5)', transition: 'width 0.6s ease',
    }} />
  </div>
));

HeaderBar.displayName = 'HeaderBar';
export default HeaderBar;
