// src/components/PieChart.tsx
import React from 'react';

export type PieChartProps = {
  /**
   * labels: array of segment names
   * values: corresponding numeric values (percentages)
   * colors?: optional array of CSS color strings
   */
  labels: string[];
  values: number[];
  colors?: string[];
  /** optional width/height (defaults to full container) */
  size?: number;
};

const defaultColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
];

const PieChart: React.FC<PieChartProps> = ({
  labels,
  values,
  colors = defaultColors,
  size,
}) => {
  // total sum (avoid zero division)
  const total = values.reduce((sum, v) => sum + v, 0) || 1;

  // placeholder when no data
  if (!labels.length || !values.length) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // compute arcs
  let cumulativeAngle = -90; // start at 12 o'clock
  const arcs = values.map((v, i) => {
    const angle = (v / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const rad1 = (Math.PI / 180) * startAngle;
    const rad2 = (Math.PI / 180) * endAngle;
    const x1 = 50 + 40 * Math.cos(rad1);
    const y1 = 50 + 40 * Math.sin(rad1);
    const x2 = 50 + 40 * Math.cos(rad2);
    const y2 = 50 + 40 * Math.sin(rad2);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const d = `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 40 40 0 ${largeArcFlag} 1 ${x2.toFixed(
      2
    )} ${y2.toFixed(2)} Z`;

    return { d, color: colors[i % colors.length] };
  });

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-lg overflow-hidden"
      style={{ width: size || '100%', height: size || '100%' }}
    >
      {/* subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />

      {/* pie SVG */}
      <svg viewBox="0 0 100 100" className="relative w-full h-full">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill={arc.color} stroke="#fff" strokeWidth="0.5" />
        ))}
      </svg>

      {/* legend */}
      <div className="absolute top-2 right-2 flex flex-col space-y-1 text-xs">
        {labels.map((label, i) => {
          const pct = ((values[i] / total) * 100).toFixed(1);
          return (
            <div key={i} className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="truncate">{label}</span>
              <span className="ml-1 font-semibold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChart;
