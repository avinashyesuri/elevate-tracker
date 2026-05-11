import React, { useState } from 'react';
import { THEME } from '../../constants/theme';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'habits', icon: '◉', label: 'Habits' },
  { id: 'tasks', icon: '▣', label: 'Tasks' },
  { id: 'research', icon: '◎', label: 'Research' },
  { id: 'analytics', icon: '◆', label: 'Analytics' },
  { id: 'history', icon: '◷', label: 'History' },
];

const SideNavItem = React.memo(({ item, active, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = active === item.id;
  return (
    <button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
        background: isActive ? THEME.accentMuted : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: `1px solid ${isActive ? THEME.borderAccent : 'transparent'}`,
        borderRadius: THEME.radiusSm, cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: THEME.transition,
      }}
    >
      <span style={{ fontSize: '14px', color: isActive ? THEME.accent : THEME.textMuted, transition: THEME.transition }}>{item.icon}</span>
      <span style={{
        fontSize: '13px', fontFamily: THEME.fontBody, fontWeight: isActive ? 500 : 400,
        color: isActive ? THEME.textPrimary : hovered ? THEME.textSecondary : THEME.textMuted,
        transition: THEME.transition,
      }}>{item.label}</span>
      {isActive && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: THEME.accent }} />}
    </button>
  );
});

SideNavItem.displayName = 'SideNavItem';

const Sidebar = React.memo(({ activeTab, onTabChange, session, onLogout }) => {
  return (
    <aside style={{
      width: '240px', minWidth: '240px', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: THEME.bgCard, borderRight: `1px solid ${THEME.border}`,
      display: 'flex', flexDirection: 'column', padding: '0', zIndex: 100, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: THEME.accent, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '16px', color: '#060606', fontWeight: 700 }}>E</span>
          </div>
          <div>
            <div style={{ fontFamily: THEME.fontHeading, fontSize: '18px', fontWeight: 700, color: THEME.textPrimary, letterSpacing: '0.08em' }}>ELEVATE</div>
            <div style={{ fontFamily: THEME.fontMono, fontSize: '9px', color: THEME.textMuted, letterSpacing: '0.15em' }}>TRACKER v2.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontFamily: THEME.fontMono, fontSize: '9px', color: THEME.textMuted, letterSpacing: '0.12em', padding: '4px 8px 8px', textTransform: 'uppercase' }}>Navigation</div>
        {NAV_ITEMS.map(item => (
          <SideNavItem key={item.id} item={item} active={activeTab} onClick={onTabChange} />
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: THEME.radiusSm, border: `1px solid ${THEME.border}` }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: THEME.accentMuted,
            border: `1px solid ${THEME.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', color: THEME.accent, fontWeight: 600, fontFamily: THEME.fontMono }}>
              {session?.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: THEME.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.name}</div>
            <div style={{ fontSize: '10px', color: THEME.textMuted, fontFamily: THEME.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.email}</div>
          </div>
          <button onClick={onLogout} title="Logout" style={{
            background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted,
            fontSize: '14px', padding: '2px', flexShrink: 0, transition: THEME.transition,
          }}
            onMouseEnter={e => e.currentTarget.style.color = THEME.red}
            onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}
          >⏻</button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
