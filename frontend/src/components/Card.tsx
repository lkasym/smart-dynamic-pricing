import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Tailwind padding classes, e.g. "p-4", "px-6 py-8" */
  padding?: string;
  /** Extra classes to apply to the outer container */
  className?: string;
  /** If true, card will lift on hover */
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  headerAction,
  footer,
  children,
  padding = 'p-6',
  className = '',
  hoverable = true,
}) => {
  const containerClasses = [
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-2xl',
    'overflow-hidden',
    hoverable ? 'shadow-sm hover:shadow-lg transition-shadow duration-300' : 'shadow',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
          )}
          {headerAction && (
            <div className="ml-4">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className={padding}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
