import React, { useState, useMemo, useCallback } from 'react';
import { THEME } from '../constants/theme';
import { useStorage } from '../hooks/useStorage';
import { getDayLabel, formatTime } from '../utils/dates';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const FILTERS = ['All', 'Tasks', 'Research', 'Habits'];

const TYPE_COLORS = {
  task: { color: THEME.blue, bg: THEME.blueMuted, border: 'rgba(74,158,255,0.3)' },
  research: { color: THEME.purple, bg: THEME.purpleMuted, border: 'rgba(155,109,255,0.3)' },
  habit: { color: THEME.accent, bg: THEME.accentMuted, border: THEME.borderAccent },
};

const ACTION_ICONS = {
  created: '＋', completed: '✓', reopened: '↺', deleted: '✕', cleared: '⊘',
  added: '＋', read: '✓', unread: '↺',
  checked: '✓', unchecked: '○',
};

const HistoryItem = React.memo(({ entry }) => {
  const tc = TYPE_COLORS[entry.type] || TYPE_COLORS.task;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px',
      border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusSm,
      background: 'transparent', transition: THEME.transition,
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
        background: tc.bg, border: `1px solid ${tc.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', color: tc.color,
      }}>
        {ACTION_ICONS[entry.action] || '·'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge color={tc.color} bg={tc.bg} border={tc.border}>{entry.type}</Badge>
          <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{entry.action}</span>
        </div>
        <div style={{ fontSize: '13px', color: THEME.textPrimary, marginTop: '4px', wordBreak: 'break-word', lineHeight: 1.4 }}>
          {entry.label}
        </div>
      </div>
      <span style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: THEME.textMuted, flexShrink: 0, marginTop: '2px' }}>
        {formatTime(entry.timestamp)}
      </span>
    </div>
  );
});
HistoryItem.displayName = 'HistoryItem';

const HistoryScreen = React.memo(({ userId }) => {
  const [history, , setHistory] = useStorage(userId, 'history', []);
  const [filter, setFilter] = useState('All');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'All') return history;
    const typeMap = { Tasks: 'task', Research: 'research', Habits: 'habit' };
    return history.filter(e => e.type === typeMap[filter]);
  }, [history, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const entry of filtered) {
      const label = getDayLabel(entry.timestamp);
      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    }
    return groups;
  }, [filtered]);

  const stats = useMemo(() => ({
    total: history.length,
    tasks: history.filter(e => e.type === 'task').length,
    research: history.filter(e => e.type === 'research').length,
    habits: history.filter(e => e.type === 'habit').length,
  }), [history]);

  const handleClear = useCallback(() => {
    setHistory([]);
    setConfirmClear(false);
  }, [setHistory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ConfirmDialog
        open={confirmClear}
        title="Clear History"
        message="Remove all history entries? This cannot be undone."
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: THEME.fontHeading, fontSize: '28px', fontWeight: 700, color: THEME.textPrimary }}>History</h2>
          <p style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '2px' }}>
            {stats.total} events logged
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>Clear History</Button>
        )}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Total', value: stats.total, color: THEME.textPrimary },
          { label: 'Tasks', value: stats.tasks, color: THEME.blue },
          { label: 'Research', value: stats.research, color: THEME.purple },
          { label: 'Habits', value: stats.habits, color: THEME.accent },
        ].map(s => (
          <Card key={s.label} padding="14px">
            <div style={{ fontSize: '20px', fontFamily: THEME.fontMono, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontFamily: THEME.fontMono,
              cursor: 'pointer', transition: THEME.transition,
              background: filter === f ? THEME.accentMuted : 'transparent',
              color: filter === f ? THEME.accent : THEME.textSecondary,
              border: `1px solid ${filter === f ? THEME.borderAccent : THEME.border}`,
            }}
          >{f}</button>
        ))}
      </div>

      {/* Grouped history */}
      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon="◷" title="No history yet" description="Your actions will appear here as you use the app." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(grouped).map(([dateLabel, entries]) => (
            <div key={dateLabel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dateLabel}</span>
                <div style={{ flex: 1, height: '1px', background: THEME.border }} />
                <span style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: THEME.textMuted }}>{entries.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entries.map(entry => <HistoryItem key={entry.id} entry={entry} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

HistoryScreen.displayName = 'HistoryScreen';
export default HistoryScreen;
