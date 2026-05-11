import React, { useState } from 'react';
import { THEME } from '../../constants/theme';

const Card = React.memo(({ children, style = {}, hoverable = false, glow = false, padding = '20px' }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: THEME.bgCard,
        border: `1px solid ${hovered && hoverable ? THEME.borderHover : THEME.border}`,
        borderRadius: THEME.radius,
        padding,
        transition: THEME.transition,
        boxShadow: glow ? THEME.shadowAccent : THEME.shadow,
        transform: hoverable && hovered ? 'translateY(-1px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
