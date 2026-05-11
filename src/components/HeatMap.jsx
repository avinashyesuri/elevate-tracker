import React, { useState } from 'react';
import { THEME } from '../constants/theme';
import { getLast84Days, formatDate } from '../utils/dates';
import { HABITS } from '../constants/habits';

function getIntensityColor(pct) {
  if (pct === null || pct === undefined) return 'rgba(255,255,255,0.04)';
  if (pct === 0) return 'rgba(200,245,53,0.06)';
  if (pct < 25) return 'rgba(200,245,53,0.15)';
  if (pct < 50) return 'rgba(200,245,53,0.30)';
  if (pct < 75) return 'rgba(200,245,53,0.55)';
  return 'rgba(200,245,53,0.9)';
}

const HeatmapCell = React.memo(({ date, pct, done, total }) => {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        style={{
          width: '11px', height: '11px', borderRadius: '2px',
          background: getIntensityColor(pct),
          cursor: 'pointer', transition: 'transform 0.1s ease',
          transform: hovered ? 'scale(1.4)' : 'scale(1)',
          border: hovered ? `1px solid rgba(200,245,53,0.5)` : '1px solid transparent',
        }}
      />
      {hovered && (
        <div style={{
          position: 'fixed', left: pos.x + 12, top: pos.y - 40,
          background: THEME.bgCard, border: `1px solid ${THEME.border}`,
          borderRadius: THEME.radiusSm, padding: '6px 10px',
          fontSize: '10px', fontFamily: THEME.fontMono, color: THEME.textPrimary,
          zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: THEME.shadow,
        }}>
          <div>{formatDate(date)}</div>
          <div style={{ color: THEME.accent, marginTop: '2px' }}>
            {done !== undefined ? `${done}/${total} habits (${pct ?? 0}%)` : 'No data'}
          </div>
        </div>
      )}
    </div>
  );
});
HeatmapCell.displayName = 'HeatmapCell';

const HeatMap = React.memo(({ habitData }) => {
  const days = getLast84Days();
  const total = HABITS.length;
  const completions = habitData?.completions || {};

  const cellData = days.map(date => {
    const dayComps = completions[date];
    if (!dayComps) return { date, pct: null, done: 0, total };
    const done = HABITS.filter(h => dayComps[h.id]).length;
    return { date, pct: Math.round((done / total) * 100), done, total };
  });

  // Group into weeks (columns of 7)
  const weeks = [];
  for (let i = 0; i < cellData.length; i += 7) {
    weeks.push(cellData.slice(i, i + 7));
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '16px' }}>
          {dayLabels.map((d, i) => (
            <div key={i} style={{ height: '11px', fontSize: '8px', color: THEME.textMuted, fontFamily: THEME.fontMono, lineHeight: '11px', width: '10px', textAlign: 'center' }}>
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', paddingLeft: '2px' }}>
            {weeks.map((week, wi) => {
              const firstDay = new Date(week[0].date + 'T00:00:00');
              const showMonth = wi === 0 || new Date(weeks[wi - 1]?.[0]?.date + 'T00:00:00').getMonth() !== firstDay.getMonth();
              return (
                <div key={wi} style={{ fontSize: '8px', color: showMonth ? THEME.textMuted : 'transparent', fontFamily: THEME.fontMono, width: '11px', textAlign: 'center', overflow: 'visible', whiteSpace: 'nowrap' }}>
                  {showMonth ? months[firstDay.getMonth()] : ''}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {week.map((cell, di) => (
                  <HeatmapCell key={cell.date} {...cell} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
        <span style={{ fontSize: '9px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>Less</span>
        {[null, 0, 25, 50, 75, 100].map((p, i) => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: getIntensityColor(p) }} />
        ))}
        <span style={{ fontSize: '9px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>More</span>
      </div>
    </div>
  );
});

HeatMap.displayName = 'HeatMap';
export default HeatMap;
