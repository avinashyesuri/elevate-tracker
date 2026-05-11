import React from 'react';
import { THEME } from '../../constants/theme';
import Button from './Button';

const ConfirmDialog = React.memo(({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusLg,
        padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <h3 style={{ fontFamily: THEME.fontHeading, fontSize: '22px', fontWeight: 600, color: THEME.textPrimary, marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: THEME.textSecondary, lineHeight: 1.6, marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';
export default ConfirmDialog;
