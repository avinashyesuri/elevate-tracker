import React, { useState } from 'react';
import { THEME } from '../../constants/theme';

const Input = React.memo(React.forwardRef(({
  value, onChange, onKeyDown, placeholder, type = 'text',
  style = {}, label, error, autoFocus, disabled,
}, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '11px', fontFamily: THEME.fontMono, color: THEME.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        style={{
          width: '100%', padding: '10px 14px', background: THEME.bgInput,
          border: `1px solid ${error ? THEME.red : focused ? THEME.borderAccent : THEME.border}`,
          borderRadius: THEME.radiusSm, color: THEME.textPrimary, fontSize: '13px',
          fontFamily: THEME.fontBody, outline: 'none', transition: THEME.transition,
          opacity: disabled ? 0.5 : 1,
          boxShadow: focused ? `0 0 0 3px rgba(200,245,53,0.08)` : 'none',
          ...style,
        }}
      />
      {error && <span style={{ fontSize: '11px', color: THEME.red, fontFamily: THEME.fontMono }}>{error}</span>}
    </div>
  );
}));

Input.displayName = 'Input';
export default Input;
