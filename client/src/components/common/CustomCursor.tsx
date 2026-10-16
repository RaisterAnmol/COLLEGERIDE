import React from 'react';

/**
 * CustomCursor: Disabled per Campus Atlas anti-slop guidelines (Rule R1 / Tell #1).
 * Native OS cursor is preserved for genuine accessibility, predictable performance,
 * and elimination of requestAnimationFrame mouse listener slop.
 */
export const CustomCursor: React.FC = () => {
  return null;
};

export default CustomCursor;
