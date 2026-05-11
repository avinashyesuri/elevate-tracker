import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { THEME } from './constants/theme';
import { getSession, logout } from './services/storage';
import { useStorage } from './hooks/useStorage';
import { todayStr } from './utils/dates';
import { HABITS } from './constants/habits';

import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import HabitsScreen from './screens/HabitsScreen';
import TasksScreen from './screens/TasksScreen';
import ResearchScreen from './screens/ResearchScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import HistoryScreen from './screens/HistoryScreen';

import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import HeaderBar from './components/layout/HeaderBar';

function useViewport() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [activeTab, setActiveTab] = useState('dashboard');
  const width = useViewport();

  const isDesktop = width >= 1100;
  const isTablet = width >= 700 && width < 1100;
  const isMobile = width < 700;

  const userId = session?.userId || null;

  // History stored per user
  const [history, setHistory] = useStorage(userId, 'history', []);
  const addHistory = useCallback((entry) => {
    setHistory(prev => {
      const next = [{ ...entry, id: Date.now() + Math.random(), timestamp: Date.now() }, ...(prev || [])];
      return next.slice(0, 500);
    });
  }, [setHistory]);

  // Today's habit progress for header bar
  const [habitData] = useStorage(userId, 'habits', {});
  const headerProgress = useMemo(() => {
    const today = todayStr();
    const completions = habitData?.completions || {};
    const todayChecked = completions[today] || {};
    const done = HABITS.filter(h => todayChecked[h.id]).length;
    return Math.round((done / HABITS.length) * 100);
  }, [habitData]);

  const handleAuth = useCallback((sess) => { setSession(sess); setActiveTab('dashboard'); }, []);
  const handleLogout = useCallback(() => { logout(); setSession(null); setActiveTab('dashboard'); }, []);
  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  if (!session) return <AuthScreen onAuth={handleAuth} />;

  const topOffset = isDesktop ? 0 : isTablet ? 104 : 48;
  const bottomPad = isMobile ? 68 : 0;

  const screenProps = { userId, session, addHistory, onNavigate: handleTabChange };

  const screens = {
    dashboard: <DashboardScreen {...screenProps} />,
    habits: <HabitsScreen {...screenProps} />,
    tasks: <TasksScreen {...screenProps} />,
    research: <ResearchScreen {...screenProps} />,
    analytics: <AnalyticsScreen {...screenProps} />,
    history: <HistoryScreen {...screenProps} />,
  };

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, display: 'flex' }}>
      {/* Desktop sidebar */}
      {isDesktop && (
        <>
          <HeaderBar progress={headerProgress} />
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} session={session} onLogout={handleLogout} />
        </>
      )}

      {/* Mobile / Tablet nav */}
      {!isDesktop && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          session={session}
          onLogout={handleLogout}
          isTablet={isTablet}
        />
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: isDesktop ? '240px' : 0,
        paddingTop: isDesktop ? '24px' : `${topOffset + 16}px`,
        paddingBottom: `${bottomPad + 24}px`,
        paddingLeft: isDesktop ? '32px' : '16px',
        paddingRight: isDesktop ? '32px' : '16px',
        maxWidth: isDesktop ? 'none' : '100%',
        overflowX: 'hidden',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {screens[activeTab] || screens.dashboard}
        </div>
      </main>
    </div>
  );
}
