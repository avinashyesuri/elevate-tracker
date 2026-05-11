import React, { useMemo } from 'react';
import { THEME } from '../constants/theme';
import { HABITS, CATEGORIES, CATEGORY_COLORS } from '../constants/habits';
import { useStorage } from '../hooks/useStorage';
import { todayStr, getLast7Days, getLast30Days } from '../utils/dates';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import HeatMap from '../components/HeatMap';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: THEME.bgCard, border: `1px solid ${THEME.border}`,
      borderRadius: THEME.radiusSm, padding: '8px 12px', fontSize: '11px',
    }}>
      <div style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono, marginBottom: '2px' }}>{label}</div>
      <div style={{ color: THEME.accent, fontFamily: THEME.fontMono }}>{payload[0].value}%</div>
    </div>
  );
};

const QuickStatCard = React.memo(({ icon, label, value, color, sub }) => (
  <Card hoverable padding="16px">
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '24px', fontFamily: THEME.fontMono, fontWeight: 600, color: color || THEME.textPrimary, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '4px', fontFamily: THEME.fontBody }}>{sub}</div>}
  </Card>
));
QuickStatCard.displayName = 'QuickStatCard';

const DashboardScreen = React.memo(({ userId, session, onNavigate }) => {
  const today = todayStr();
  const [habitData] = useStorage(userId, 'habits', {});
  const [tasks] = useStorage(userId, 'tasks', []);
  const [research] = useStorage(userId, 'research', []);
  const completions = habitData?.completions || {};
  const total = HABITS.length;

  const todayChecked = completions[today] || {};

  const stats = useMemo(() => {
    const done = HABITS.filter(h => todayChecked[h.id]).length;
    const pct = Math.round((done / total) * 100);

    // Streak
    let streak = 0;
    const checkDate = new Date(today + 'T00:00:00');
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().slice(0, 10);
      const dayComps = completions[ds] || {};
      const dayDone = HABITS.filter(h => dayComps[h.id]).length;
      if ((dayDone / total) >= 0.5) streak++;
      else if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Category stats
    const catStats = {};
    CATEGORIES.forEach(cat => {
      const catHabits = HABITS.filter(h => h.category === cat);
      const catDone = catHabits.filter(h => todayChecked[h.id]).length;
      catStats[cat] = { total: catHabits.length, done: catDone, pct: Math.round((catDone / catHabits.length) * 100) };
    });

    // Last 7 days chart
    const last7 = getLast7Days().map(date => {
      const dayComps = completions[date] || {};
      const dayDone = HABITS.filter(h => dayComps[h.id]).length;
      const d = new Date(date + 'T00:00:00');
      return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), pct: Math.round((dayDone / total) * 100) };
    });

    // Last 30 for mini trend
    const last30 = getLast30Days().map(date => {
      const dayComps = completions[date] || {};
      const dayDone = HABITS.filter(h => dayComps[h.id]).length;
      return { date: date.slice(5), pct: Math.round((dayDone / total) * 100) };
    });

    const tasksDone = tasks.filter(t => t.done).length;
    const researchUnread = research.filter(r => !r.read).length;

    return { done, pct, streak, catStats, last7, last30, tasksDone, tasksTotal: tasks.length, researchUnread };
  }, [todayChecked, completions, today, total, tasks, research]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: THEME.fontMono, fontSize: '11px', color: THEME.textMuted, letterSpacing: '0.1em', marginBottom: '4px' }}>{greeting},</p>
          <h1 style={{ fontFamily: THEME.fontHeading, fontSize: '36px', fontWeight: 700, color: THEME.textPrimary, lineHeight: 1 }}>{session?.name}</h1>
          <p style={{ fontSize: '12px', color: THEME.textMuted, marginTop: '6px', fontFamily: THEME.fontMono }}>
            {today} · {stats.done}/{total} habits done
          </p>
        </div>
        <ProgressRing value={stats.pct} size={100} strokeWidth={7} label={`${stats.pct}%`} sublabel="today" />
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <QuickStatCard icon="🔥" label="Streak" value={`${stats.streak}d`} color={THEME.orange} sub="50%+ days" />
        <QuickStatCard icon="✅" label="Habits" value={`${stats.done}/${total}`} color={THEME.accent} sub="today" />
        <QuickStatCard icon="▣" label="Tasks" value={`${stats.tasksDone}/${stats.tasksTotal}`} color={THEME.blue} sub="completed" />
        <QuickStatCard icon="◎" label="Research" value={stats.researchUnread} color={THEME.purple} sub="unread items" />
      </div>

      {/* Category bars + mini chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Card>
          <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary, marginBottom: '14px' }}>Categories Today</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CATEGORIES.map(cat => {
              const s = stats.catStats[cat];
              const color = CATEGORY_COLORS[cat];
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: THEME.textSecondary, fontFamily: THEME.fontBody }}>{cat}</span>
                    <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color }}>{s.done}/{s.total}</span>
                  </div>
                  <ProgressBar value={s.pct} color={color} height={5} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary, marginBottom: '14px' }}>This Week</h3>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={stats.last7} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid stroke={THEME.border} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: THEME.textMuted, fontSize: 9, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: THEME.textMuted, fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pct" fill={THEME.accent} radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 30 day trend */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary }}>30-Day Trend</h3>
          <button onClick={() => onNavigate('analytics')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: THEME.accent, fontSize: '11px', fontFamily: THEME.fontMono,
          }}>View Analytics →</button>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={stats.last30} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.25} />
                <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={THEME.border} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: THEME.textMuted, fontSize: 8, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fill: THEME.textMuted, fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pct" stroke={THEME.accent} strokeWidth={1.5} fill="url(#dashGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Heatmap */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary }}>84-Day Heatmap</h3>
          {stats.streak > 0 && <Badge>🔥 {stats.streak} day streak</Badge>}
        </div>
        <HeatMap habitData={habitData} />
      </Card>

      {/* Recent tasks */}
      {tasks.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary }}>Recent Tasks</h3>
            <button onClick={() => onNavigate('tasks')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: THEME.accent, fontSize: '11px', fontFamily: THEME.fontMono,
            }}>View All →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                background: 'rgba(255,255,255,0.02)', borderRadius: THEME.radiusSm, border: `1px solid ${THEME.border}`,
              }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0,
                  background: task.done ? THEME.accent : 'transparent',
                  border: `2px solid ${task.done ? THEME.accent : THEME.textMuted}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {task.done && <span style={{ fontSize: '8px', color: '#060606' }}>✓</span>}
                </div>
                <span style={{
                  flex: 1, fontSize: '12px', color: task.done ? THEME.textMuted : THEME.textPrimary,
                  textDecoration: task.done ? 'line-through' : 'none',
                }}>{task.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
});

DashboardScreen.displayName = 'DashboardScreen';
export default DashboardScreen;
