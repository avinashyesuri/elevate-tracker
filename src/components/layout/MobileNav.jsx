import React, { useState } from 'react';
import { THEME } from '../../constants/theme';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◈', label: 'Home' },
  { id: 'habits', icon: '◉', label: 'Habits' },
  { id: 'tasks', icon: '▣', label: 'Tasks' },
  { id: 'research', icon: '◎', label: 'Research' },
  { id: 'analytics', icon: '◆', label: 'Stats' },
  { id: 'history', icon: '◷', label: 'History' },
];

const MobileTabItem = React.memo(({ item, active, onClick }) => {
  const isActive = active === item.id;
  return (
    <button
      onClick={() => onClick(item.id)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px',
        transition: THEME.transition,
      }}
    >
      <span style={{ fontSize: '16px', color: isActive ? THEME.accent : THEME.textMuted, transition: THEME.transition }}>{item.icon}</span>
      <span style={{ fontSize: '9px', fontFamily: THEME.fontMono, color: isActive ? THEME.accent : THEME.textMuted, letterSpacing: '0.06em' }}>{item.label}</span>
      {isActive && <div style={{ width: '16px', height: '2px', borderRadius: '1px', background: THEME.accent }} />}
    </button>
  );
});

MobileTabItem.displayName = 'MobileTabItem';

const MobileNav = React.memo(({ activeTab, onTabChange, session, onLogout, isTablet }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isTablet) {
    return (
      <>
        {/* Top header */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
          background: THEME.bgCard, borderBottom: `1px solid ${THEME.border}`,
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', zIndex: 200,
        }}>
          <button onClick={() => setDrawerOpen(true)} style={{
            background: 'none', border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusSm,
            color: THEME.textPrimary, fontSize: '16px', cursor: 'pointer', padding: '6px 10px',
          }}>☰</button>
          <div style={{ fontFamily: THEME.fontHeading, fontSize: '20px', fontWeight: 700, color: THEME.textPrimary, letterSpacing: '0.06em' }}>ELEVATE</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{session?.name}</div>
            <button onClick={onLogout} style={{
              background: THEME.redMuted, border: `1px solid rgba(255,68,68,0.3)`, borderRadius: THEME.radiusSm,
              color: THEME.red, fontSize: '11px', cursor: 'pointer', padding: '4px 8px', fontFamily: THEME.fontMono,
            }}>logout</button>
          </div>
        </div>

        {/* Pill Nav */}
        <div style={{
          position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 150,
          background: THEME.bgCard, borderBottom: `1px solid ${THEME.border}`,
          padding: '8px 16px', display: 'flex', gap: '6px', overflowX: 'auto',
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontFamily: THEME.fontMono,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: THEME.transition,
                background: activeTab === item.id ? THEME.accentMuted : 'transparent',
                color: activeTab === item.id ? THEME.accent : THEME.textSecondary,
                border: `1px solid ${activeTab === item.id ? THEME.borderAccent : THEME.border}`,
              }}
            >{item.icon} {item.label}</button>
          ))}
        </div>

        {/* Drawer */}
        {drawerOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
            <div onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '260px',
              background: THEME.bgCard, borderRight: `1px solid ${THEME.border}`,
              padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <div style={{ fontFamily: THEME.fontHeading, fontSize: '22px', fontWeight: 700, color: THEME.textPrimary, marginBottom: '16px' }}>ELEVATE</div>
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setDrawerOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    background: activeTab === item.id ? THEME.accentMuted : 'transparent',
                    border: `1px solid ${activeTab === item.id ? THEME.borderAccent : 'transparent'}`,
                    borderRadius: THEME.radiusSm, cursor: 'pointer', color: activeTab === item.id ? THEME.textPrimary : THEME.textSecondary,
                    fontSize: '13px', fontFamily: THEME.fontBody, textAlign: 'left',
                  }}
                >
                  <span style={{ color: activeTab === item.id ? THEME.accent : THEME.textMuted }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Mobile bottom nav
  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '48px',
        background: THEME.bgCard, borderBottom: `1px solid ${THEME.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 200,
      }}>
        <div style={{ fontFamily: THEME.fontHeading, fontSize: '18px', fontWeight: 700, color: THEME.textPrimary, letterSpacing: '0.06em' }}>ELEVATE</div>
        <button onClick={onLogout} style={{
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
          color: THEME.textMuted, fontSize: '16px',
        }}>⏻</button>
      </div>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
        background: THEME.bgCard, borderTop: `1px solid ${THEME.border}`,
        display: 'flex', zIndex: 200,
      }}>
        {NAV_ITEMS.map(item => (
          <MobileTabItem key={item.id} item={item} active={activeTab} onClick={onTabChange} />
        ))}
      </div>
    </>
  );
});

MobileNav.displayName = 'MobileNav';
export default MobileNav;
