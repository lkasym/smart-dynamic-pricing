// src/components/StatCard.tsx
import React, { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string | number;
  icon?: ReactNode;
}

const UpArrow = () => (
  <svg
    className="w-3 h-3 inline-block"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const DownArrow = () => (
  <svg
    className="w-3 h-3 inline-block"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon,
}) => {
  const positive = trend === 'up';

  return (
    <div
      className="
        bg-white border border-gray-100 rounded-2xl 
        shadow-sm hover:shadow-md transform hover:-translate-y-1
        transition-all duration-200
        p-6 flex flex-col justify-between
      "
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="bg-blue-50 p-2 rounded-full text-blue-600">
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue != null && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`
              inline-flex items-center px-2 py-1 rounded-full font-medium
              ${positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}
          >
            {positive ? <UpArrow /> : <DownArrow />} 
            <span className="ml-1">{trendValue}</span>
          </span>
          <span className="ml-3 text-xs text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
