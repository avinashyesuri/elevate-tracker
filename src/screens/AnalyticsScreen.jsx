import React, { useMemo } from 'react';
import { THEME, } from '../constants/theme';
import { HABITS, CATEGORIES, CATEGORY_COLORS } from '../constants/habits';
import { useStorage } from '../hooks/useStorage';
import { todayStr, getLast30Days, getLast7Days } from '../utils/dates';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
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
      borderRadius: THEME.radiusSm, padding: '10px 14px', fontSize: '12px',
    }}>
      <div style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono, marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || THEME.accent, fontFamily: THEME.fontMono }}>{p.value}%</div>
      ))}
    </div>
  );
};

const StatCard = React.memo(({ icon, label, value, sub, color }) => (
  <Card hoverable>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: THEME.radiusSm, flexShrink: 0,
        background: `${color || THEME.accent}18`, border: `1px solid ${color || THEME.accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '22px', fontFamily: THEME.fontMono, fontWeight: 600, color: color || THEME.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '11px', color: THEME.textSecondary, marginTop: '4px', fontFamily: THEME.fontBody }}>{label}</div>
        {sub && <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '2px', fontFamily: THEME.fontMono }}>{sub}</div>}
      </div>
    </div>
  </Card>
));
StatCard.displayName = 'StatCard';

const AnalyticsScreen = React.memo(({ userId }) => {
  const [habitData] = useStorage(userId, 'habits', {});
  const completions = habitData?.completions || {};
  const today = todayStr();
  const total = HABITS.length;

  const analytics = useMemo(() => {
    const last30 = getLast30Days();
    const last7 = getLast7Days();

    let daysTracked = 0;
    let totalPct = 0;
    let streakCurrent = 0;
    let streakCounting = true;

    const allDays = Object.keys(completions).sort();
    const dayMap = {};

    for (const day of allDays) {
      const dayComps = completions[day] || {};
      const done = HABITS.filter(h => dayComps[h.id]).length;
      const pct = Math.round((done / total) * 100);
      dayMap[day] = pct;
      if (pct > 0) { daysTracked++; totalPct += pct; }
    }

    // Streak
    const checkDate = new Date(today + 'T00:00:00');
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().slice(0, 10);
      const pct = dayMap[ds] || 0;
      if (pct >= 50) { streakCurrent++; }
      else if (i > 0) { streakCounting = false; break; }
      else if (i === 0) { /* skip today if not done */ }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const avgPct = daysTracked > 0 ? Math.round(totalPct / daysTracked) : 0;

    const chart30 = last30.map(date => {
      const dayComps = completions[date] || {};
      const done = HABITS.filter(h => dayComps[h.id]).length;
      return {
        date: date.slice(5), // MM-DD
        pct: Math.round((done / total) * 100),
      };
    });

    const chart7 = last7.map(date => {
      const dayComps = completions[date] || {};
      const done = HABITS.filter(h => dayComps[h.id]).length;
      const d = new Date(date + 'T00:00:00');
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        pct: Math.round((done / total) * 100),
      };
    });

    const habitRates = HABITS.map(h => {
      const dates = Object.keys(completions);
      const done = dates.filter(d => completions[d]?.[h.id]).length;
      const possible = dates.length;
      return { ...h, rate: possible > 0 ? Math.round((done / possible) * 100) : 0 };
    }).sort((a, b) => b.rate - a.rate);

    return { streakCurrent, avgPct, daysTracked, chart30, chart7, habitRates };
  }, [completions, today, total]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontFamily: THEME.fontHeading, fontSize: '28px', fontWeight: 700, color: THEME.textPrimary }}>Analytics</h2>
        <p style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '2px' }}>Your habit performance over time</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <StatCard icon="🔥" label="Current Streak" value={`${analytics.streakCurrent}d`} sub="50%+ days" color={THEME.orange} />
        <StatCard icon="📊" label="All-time Avg" value={`${analytics.avgPct}%`} sub="completion rate" color={THEME.accent} />
        <StatCard icon="📅" label="Days Tracked" value={analytics.daysTracked} sub="total days" color={THEME.blue} />
        <StatCard icon="✅" label="Total Habits" value={total} sub="per day" color={THEME.purple} />
      </div>

      {/* 30-day area chart */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary }}>30-Day Trend</h3>
          <span style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: THEME.textMuted }}>% completed</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={analytics.chart30} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={THEME.border} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: THEME.textMuted, fontSize: 9, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: THEME.textMuted, fontSize: 9, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pct" stroke={THEME.accent} strokeWidth={2} fill="url(#areaGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Weekly bar chart */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary }}>This Week</h3>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={analytics.chart7} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={THEME.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: THEME.textMuted, fontSize: 10, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: THEME.textMuted, fontSize: 9, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" fill={THEME.accent} radius={[4, 4, 0, 0]} opacity={0.9} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Habit success rates */}
      <Card>
        <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary, marginBottom: '16px' }}>Per-Habit Success Rate</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analytics.habitRates.map(h => {
            const color = CATEGORY_COLORS[h.category] || THEME.accent;
            return (
              <div key={h.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: THEME.textSecondary, fontFamily: THEME.fontBody }}>
                    {h.icon} {h.label}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color }}>{h.rate}%</span>
                </div>
                <ProgressBar value={h.rate} color={color} height={3} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Heatmap */}
      <Card>
        <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '18px', color: THEME.textPrimary, marginBottom: '16px' }}>84-Day Heatmap</h3>
        <HeatMap habitData={habitData} />
      </Card>
    </div>
  );
});

AnalyticsScreen.displayName = 'AnalyticsScreen';
export default AnalyticsScreen;
