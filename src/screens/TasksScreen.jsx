import React, { useState, useCallback, useMemo, useRef } from 'react';
import { THEME, PRIORITY_COLORS } from '../constants/theme';
import { useStorage } from '../hooks/useStorage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const MAX_TASKS = 10;
const PRIORITIES = ['High', 'Medium', 'Low'];
const FILTERS = ['All', 'Active', 'Completed'];

const TaskItem = React.memo(({ task, onToggle, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Low;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: `1px solid ${hovered ? THEME.borderHover : THEME.border}`,
        borderRadius: THEME.radiusSm, transition: THEME.transition,
      }}
    >
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, cursor: 'pointer',
          background: task.done ? THEME.accent : 'transparent',
          border: `2px solid ${task.done ? THEME.accent : THEME.textMuted}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: THEME.transition,
        }}
      >
        {task.done && <span style={{ fontSize: '10px', color: '#060606', fontWeight: 700 }}>✓</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: '13px', color: task.done ? THEME.textMuted : THEME.textPrimary,
          textDecoration: task.done ? 'line-through' : 'none', transition: THEME.transition,
          wordBreak: 'break-word',
        }}>{task.text}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Badge color={pc.text} bg={pc.bg} border={pc.border}>{task.priority}</Badge>
        {task.done && <Badge>Done</Badge>}
        <button
          onClick={() => onDelete(task.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: THEME.textMuted, fontSize: '14px', padding: '2px', transition: THEME.transition,
            opacity: hovered ? 1 : 0.4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = THEME.red}
          onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}
        >✕</button>
      </div>
    </div>
  );
});
TaskItem.displayName = 'TaskItem';

const TasksScreen = React.memo(({ userId, addHistory }) => {
  const [tasks, setTasks] = useStorage(userId, 'tasks', []);
  const [inputVal, setInputVal] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (filter === 'Active') return tasks.filter(t => !t.done);
    if (filter === 'Completed') return tasks.filter(t => t.done);
    return tasks;
  }, [tasks, filter]);

  const counts = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    active: tasks.filter(t => !t.done).length,
  }), [tasks]);

  const handleAdd = useCallback(() => {
    const text = inputVal.trim();
    if (!text) { setError('Please enter a task.'); return; }
    if (tasks.length >= MAX_TASKS) { setError(`Maximum ${MAX_TASKS} tasks reached.`); return; }
    setError('');
    const newTask = { id: Date.now() + Math.random(), text, priority, done: false, createdAt: Date.now() };
    setTasks(prev => [newTask, ...prev]);
    addHistory({ type: 'task', action: 'created', label: text });
    setInputVal('');
    inputRef.current?.focus();
  }, [inputVal, tasks.length, priority, setTasks, addHistory]);

  const handleKey = useCallback((e) => { if (e.key === 'Enter') handleAdd(); }, [handleAdd]);

  const handleToggle = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newDone = !t.done;
      addHistory({ type: 'task', action: newDone ? 'completed' : 'reopened', label: t.text });
      return { ...t, done: newDone };
    }));
  }, [setTasks, addHistory]);

  const handleDelete = useCallback((id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) addHistory({ type: 'task', action: 'deleted', label: task.text });
      return prev.filter(t => t.id !== id);
    });
  }, [setTasks, addHistory]);

  const handleClearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.done));
    setConfirmClear(false);
    addHistory({ type: 'task', action: 'cleared', label: 'Cleared completed tasks' });
  }, [setTasks, addHistory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ConfirmDialog
        open={confirmClear}
        title="Clear Completed"
        message="Remove all completed tasks? This cannot be undone."
        onConfirm={handleClearCompleted}
        onCancel={() => setConfirmClear(false)}
      />

      {/* Header */}
      <div>
        <h2 style={{ fontFamily: THEME.fontHeading, fontSize: '28px', fontWeight: 700, color: THEME.textPrimary }}>Tasks</h2>
        <p style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '2px' }}>
          {counts.active} active · {counts.done} completed · {counts.total}/{MAX_TASKS}
        </p>
      </div>

      {/* Add task */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setError(''); }}
              onKeyDown={handleKey}
              placeholder="Add a new task..."
              disabled={tasks.length >= MAX_TASKS}
              style={{
                flex: 1, minWidth: '200px', padding: '10px 14px', background: THEME.bgInput,
                border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusSm,
                color: THEME.textPrimary, fontSize: '13px', fontFamily: THEME.fontBody, outline: 'none',
                transition: THEME.transition, opacity: tasks.length >= MAX_TASKS ? 0.5 : 1,
              }}
              onFocus={e => { e.target.style.borderColor = THEME.borderAccent; e.target.style.boxShadow = '0 0 0 3px rgba(200,245,53,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = THEME.border; e.target.style.boxShadow = 'none'; }}
            />
            {/* Priority selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {PRIORITIES.map(p => {
                const pc = PRIORITY_COLORS[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '6px 12px', borderRadius: THEME.radiusSm, fontSize: '11px',
                      fontFamily: THEME.fontMono, cursor: 'pointer', transition: THEME.transition,
                      background: priority === p ? pc.bg : 'transparent',
                      color: priority === p ? pc.text : THEME.textMuted,
                      border: `1px solid ${priority === p ? pc.border : THEME.border}`,
                      fontWeight: priority === p ? 600 : 400,
                    }}
                  >{p}</button>
                );
              })}
            </div>
            <Button onClick={handleAdd} disabled={tasks.length >= MAX_TASKS}>+ Add</Button>
          </div>
          {error && <span style={{ fontSize: '11px', color: THEME.red, fontFamily: THEME.fontMono }}>{error}</span>}
          {/* Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '2px', background: THEME.border, borderRadius: '1px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(tasks.length / MAX_TASKS) * 100}%`, background: tasks.length >= MAX_TASKS ? THEME.red : THEME.accent, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: tasks.length >= MAX_TASKS ? THEME.red : THEME.textMuted }}>{tasks.length}/{MAX_TASKS}</span>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
        {counts.done > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            style={{
              marginLeft: 'auto', padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              fontFamily: THEME.fontMono, cursor: 'pointer', transition: THEME.transition,
              background: 'transparent', color: THEME.red, border: `1px solid rgba(255,68,68,0.3)`,
            }}
          >Clear Completed</button>
        )}
      </div>

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <EmptyState icon="▣" title={filter === 'All' ? 'No tasks yet' : `No ${filter.toLowerCase()} tasks`} description="Add your first task above to get started." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(task => (
            <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
});

TasksScreen.displayName = 'TasksScreen';
export default TasksScreen;
