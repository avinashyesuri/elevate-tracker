import React, { useState, useCallback, useMemo, useRef } from 'react';
import { THEME } from '../constants/theme';
import { SUGGESTIONS } from '../constants/habits';
import { useStorage } from '../hooks/useStorage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatDateTime } from '../utils/dates';

const FILTERS = ['All', 'Unread', 'Read'];

const ResearchItem = React.memo(({ item, onToggleRead, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px',
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: `1px solid ${item.read ? THEME.border : hovered ? THEME.borderHover : THEME.border}`,
        borderRadius: THEME.radiusSm, transition: THEME.transition,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', color: item.read ? THEME.textMuted : THEME.textPrimary,
          wordBreak: 'break-word', lineHeight: 1.5,
        }}>{item.text}</div>
        <div style={{ fontSize: '10px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '4px' }}>
          {formatDateTime(item.createdAt)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {item.read && <Badge color={THEME.textMuted} bg="rgba(255,255,255,0.04)" border="rgba(255,255,255,0.1)">Read</Badge>}
        <button
          onClick={() => onToggleRead(item.id)}
          style={{
            padding: '4px 10px', borderRadius: THEME.radiusSm, fontSize: '10px', fontFamily: THEME.fontMono,
            cursor: 'pointer', transition: THEME.transition, border: `1px solid ${THEME.border}`,
            background: item.read ? 'transparent' : THEME.accentMuted,
            color: item.read ? THEME.textMuted : THEME.accent,
          }}
        >{item.read ? 'Unread' : '✓ Read'}</button>
        <button
          onClick={() => onDelete(item.id)}
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
ResearchItem.displayName = 'ResearchItem';

const SuggestionGroup = React.memo(({ group, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card hoverable>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '20px' }}>{group.icon}</span>
        <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: THEME.textPrimary, fontFamily: THEME.fontBody }}>{group.group}</span>
        <span style={{ color: THEME.textMuted, fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {group.items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
              background: 'rgba(255,255,255,0.02)', borderRadius: THEME.radiusSm, border: `1px solid ${THEME.border}`,
            }}>
              <span style={{ flex: 1, fontSize: '12px', color: THEME.textSecondary, fontFamily: THEME.fontBody }}>{item}</span>
              <button
                onClick={() => onSave(item)}
                style={{
                  padding: '4px 10px', borderRadius: THEME.radiusSm, fontSize: '10px', fontFamily: THEME.fontMono,
                  cursor: 'pointer', background: THEME.accentMuted, color: THEME.accent,
                  border: `1px solid ${THEME.borderAccent}`, transition: THEME.transition, whiteSpace: 'nowrap',
                }}
              >+ Save</button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});
SuggestionGroup.displayName = 'SuggestionGroup';

const ResearchScreen = React.memo(({ userId, addHistory }) => {
  const [research, setResearch] = useStorage(userId, 'research', []);
  const [inputVal, setInputVal] = useState('');
  const [filter, setFilter] = useState('All');
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (filter === 'Unread') return research.filter(r => !r.read);
    if (filter === 'Read') return research.filter(r => r.read);
    return research;
  }, [research, filter]);

  const readCount = useMemo(() => research.filter(r => r.read).length, [research]);

  const handleAdd = useCallback((text) => {
    const t = (text || inputVal).trim();
    if (!t) return;
    const item = { id: Date.now() + Math.random(), text: t, read: false, createdAt: Date.now() };
    setResearch(prev => [item, ...prev]);
    addHistory({ type: 'research', action: 'added', label: t.slice(0, 60) });
    if (!text) { setInputVal(''); inputRef.current?.focus(); }
  }, [inputVal, setResearch, addHistory]);

  const handleKey = useCallback((e) => { if (e.key === 'Enter') handleAdd(); }, [handleAdd]);

  const handleToggleRead = useCallback((id) => {
    setResearch(prev => prev.map(r => {
      if (r.id !== id) return r;
      addHistory({ type: 'research', action: r.read ? 'unread' : 'read', label: r.text.slice(0, 60) });
      return { ...r, read: !r.read };
    }));
  }, [setResearch, addHistory]);

  const handleDelete = useCallback((id) => {
    setResearch(prev => {
      const item = prev.find(r => r.id === id);
      if (item) addHistory({ type: 'research', action: 'deleted', label: item.text.slice(0, 60) });
      return prev.filter(r => r.id !== id);
    });
  }, [setResearch, addHistory]);

  const handleClearRead = useCallback(() => {
    setResearch(prev => prev.filter(r => !r.read));
    setConfirmClear(false);
    addHistory({ type: 'research', action: 'cleared', label: 'Cleared read items' });
  }, [setResearch, addHistory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ConfirmDialog
        open={confirmClear}
        title="Clear Read Items"
        message="Remove all read research items? This cannot be undone."
        onConfirm={handleClearRead}
        onCancel={() => setConfirmClear(false)}
      />

      <div>
        <h2 style={{ fontFamily: THEME.fontHeading, fontSize: '28px', fontWeight: 700, color: THEME.textPrimary }}>Research</h2>
        <p style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: '2px' }}>
          {research.length} items · {research.length - readCount} unread
        </p>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '12px' }}>
        {['list', 'suggestions'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '7px 16px', borderRadius: THEME.radiusSm, fontSize: '12px', fontFamily: THEME.fontMono,
              cursor: 'pointer', transition: THEME.transition, textTransform: 'capitalize',
              background: activeTab === t ? THEME.accentMuted : 'transparent',
              color: activeTab === t ? THEME.accent : THEME.textSecondary,
              border: `1px solid ${activeTab === t ? THEME.borderAccent : 'transparent'}`,
            }}
          >{t === 'list' ? '📚 My List' : '💡 Suggestions'}</button>
        ))}
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Add */}
          <Card>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                ref={inputRef}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Add a research topic or link..."
                style={{
                  flex: 1, padding: '10px 14px', background: THEME.bgInput,
                  border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusSm,
                  color: THEME.textPrimary, fontSize: '13px', fontFamily: THEME.fontBody, outline: 'none',
                  transition: THEME.transition,
                }}
                onFocus={e => { e.target.style.borderColor = THEME.borderAccent; }}
                onBlur={e => { e.target.style.borderColor = THEME.border; }}
              />
              <Button onClick={() => handleAdd()}>+ Add</Button>
            </div>
          </Card>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
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
            {readCount > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                style={{
                  marginLeft: 'auto', padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                  fontFamily: THEME.fontMono, cursor: 'pointer',
                  background: 'transparent', color: THEME.red, border: `1px solid rgba(255,68,68,0.3)`,
                }}
              >Clear Read</button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="◎" title="Nothing here" description="Add research topics or explore suggestions." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.map(item => (
                <ResearchItem key={item.id} item={item} onToggleRead={handleToggleRead} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: THEME.textMuted }}>Click + Save to add any suggestion to your Research list.</p>
          {SUGGESTIONS.map(group => (
            <SuggestionGroup key={group.group} group={group} onSave={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
});

ResearchScreen.displayName = 'ResearchScreen';
export default ResearchScreen;
