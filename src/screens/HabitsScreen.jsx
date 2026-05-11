import React, { useState, useCallback, useMemo } from 'react';
import { THEME, } from '../constants/theme';
import { HABITS, CATEGORIES, CATEGORY_COLORS } from '../constants/habits';
import { useStorage } from '../hooks/useStorage';
import { todayStr } from '../utils/dates';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';

const HabitNotes = React.memo(({ habitId, date, notes, onNotesChange }) => {
  const [open, setOpen] = useState(false);
  const key = `${habitId}_${date}`;
  const value = notes[key] || '';
  return (
    <div style={{ marginTop: '8px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: value ? THEME.accent : THEME.textMuted,
          fontSize: '11px', fontFamily: THEME.fontMono, padding: '0', transition: THEME.transition,
        }}
      >{open ? '▲ hide notes' : `▼ ${value ? 'view notes' : 'add notes'}`}</button>
      {open && (
        <textarea
          value={value}
          onChange={e => onNotesChange(key, e.target.value)}
          placeholder="Add notes for today..."
          style={{
            display: 'block', marginTop: '8px', width: '100%', minHeight: '64px',
            background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusSm,
            color: THEME.textPrimary, fontSize: '12px', fontFamily: THEME.fontBody,
            padding: '10px', resize: 'vertical', outline: 'none', transition: THEME.transition,
          }}
          onFocus={e => { e.target.style.borderColor = THEME.borderAccent; }}
          onBlur={e => { e.target.style.borderColor = THEME.border; }}
        />
      )}
    </div>
  );
});
HabitNotes.displayName = 'HabitNotes';

const HabitItem = React.memo(({ habit, checked, onToggle, notes, onNotesChange, date }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px',
        background: checked ? 'rgba(200,245,53,0.04)' : hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: `1px solid ${checked ? THEME.borderAccent : hovered ? THEME.borderHover : THEME.border}`,
        borderRadius: THEME.radiusSm, transition: THEME.transition, cursor: 'pointer',
      }}
      onClick={() => onToggle(habit.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Checkbox */}
        <div style={{
          width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
          background: checked ? THEME.accent : 'transparent',
          border: `2px solid ${checked ? THEME.accent : THEME.textMuted}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: THEME.transition,
        }}>
          {checked && <span style={{ fontSize: '11px', color: '#060606', fontWeight: 700 }}>✓</span>}
        </div>
        <span style={{ fontSize: '20px' }}>{habit.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px', fontWeight: 500, fontFamily: THEME.fontBody,
            color: checked ? THEME.textSecondary : THEME.textPrimary,
            textDecoration: checked ? 'line-through' : 'none',
            transition: THEME.transition,
          }}>{habit.label}</div>
          <div style={{ fontSize: '11px', color: THEME.textMuted, fontFamily: THEME.fontBody, marginTop: '1px' }}>{habit.description}</div>
        </div>
        {checked && <Badge>Done</Badge>}
      </div>
      <div onClick={e => e.stopPropagation()}>
        <HabitNotes habitId={habit.id} date={date} notes={notes} onNotesChange={onNotesChange} />
      </div>
    </div>
  );
});
HabitItem.displayName = 'HabitItem';

const HabitsScreen = React.memo(({ userId, addHistory }) => {
  const today = todayStr();
  const [habitData, setHabitData] = useStorage(userId, 'habits', {});
  const notes = habitData.notes || {};
  const completions = habitData.completions || {};
  const todayChecked = completions[today] || {};

  const handleToggle = useCallback((habitId) => {
    setHabitData(prev => {
      const comps = prev.completions || {};
      const todayComps = comps[today] || {};
      const newChecked = !todayComps[habitId];
      const habit = HABITS.find(h => h.id === habitId);
      addHistory({ type: 'habit', action: newChecked ? 'checked' : 'unchecked', label: habit?.label || habitId });
      return { ...prev, completions: { ...comps, [today]: { ...todayComps, [habitId]: newChecked } } };
    });
  }, [setHabitData, today, addHistory]);

  const handleNotesChange = useCallback((key, value) => {
    setHabitData(prev => ({ ...prev, notes: { ...(prev.notes || {}), [key]: value } }));
  }, [setHabitData]);

  const stats = useMemo(() => {
    const total = HABITS.length;
    const done = HABITS.filter(h => todayChecked[h.id]).length;
    const pct = Math.round((done / total) * 100);
    const catStats = {};
    CATEGORIES.forEach(cat => {
      const catHabits = HABITS.filter(h => h.category === cat);
      const catDone = catHabits.filter(h => todayChecked[h.id]).length;
      catStats[cat] = { total: catHabits.length, done: catDone, pct: Math.round((catDone / catHabits.length) * 100) };
    });
    return { total, done, pct, catStats };
  }, [todayChecked]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: THEME.fontHeading, fontSize: '28px', fontWeight: 700, color: THEME.textPrimary }}>Daily Habits</h2>
          <p style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '2px' }}>
            {today} — {stats.done}/{stats.total} complete
          </p>
        </div>
        <ProgressRing value={stats.pct} size={80} strokeWidth={6} label={`${stats.pct}%`} sublabel="today" />
      </div>

      {/* Category bars */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {CATEGORIES.map(cat => {
            const s = stats.catStats[cat];
            const color = CATEGORY_COLORS[cat];
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color: THEME.textSecondary, letterSpacing: '0.06em' }}>{cat}</span>
                  <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color }}>{s.done}/{s.total}</span>
                </div>
                <ProgressBar value={s.pct} color={color} height={4} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Habits by category */}
      {CATEGORIES.map(cat => {
        const catHabits = HABITS.filter(h => h.category === cat);
        const color = CATEGORY_COLORS[cat];
        return (
          <div key={cat}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '16px', background: color, borderRadius: '2px' }} />
              <span style={{ fontSize: '11px', fontFamily: THEME.fontMono, color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{cat}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {catHabits.map(habit => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  checked={!!todayChecked[habit.id]}
                  onToggle={handleToggle}
                  notes={notes}
                  onNotesChange={handleNotesChange}
                  date={today}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

HabitsScreen.displayName = 'HabitsScreen';
export default HabitsScreen;
