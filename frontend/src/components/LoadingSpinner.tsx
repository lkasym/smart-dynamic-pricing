// src/components/LoadingSpinner.tsx
import React from 'react';

export interface LoadingSpinnerProps {
  /** one of small|medium|large */
  size?: 'small' | 'medium' | 'large';
  /** Tailwind color suffix, e.g. "blue-600", "red-500" */
  color?: string;
  /** Extra classes you want to pass, e.g. "mr-2" */
  className?: string;
}

// Helper type that matches exactly our keys
type SpinnerSize = 'small' | 'medium' | 'large';

const sizeClasses: Record<SpinnerSize, string> = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',      // default to a valid SpinnerSize
  color = 'blue-600',   // default Tailwind color suffix
  className = '',
}) => {
  // Ensure we only index into sizeClasses with our SpinnerSize
  const spinnerSize = sizeClasses[size as SpinnerSize];

  // Build the Tailwind class for the border color
  // If user passed "border-red-500", keep it; otherwise prepend "border-"
  const borderColorClass = color.startsWith('border-') ? color : `border-${color}`;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
          ${spinnerSize}
          animate-spin
          rounded-full
          border-4 border-solid
          ${borderColorClass}
          border-t-transparent
        `}
      />
    </div>
  );
};

export default LoadingSpinner;
