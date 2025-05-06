// src/components/TimePricingChart.tsx
import React from 'react';

interface TimePricingChartProps {
  data?: {
    timeOfDay: string[];
    priceMultipliers: number[];
  };
}

const TimePricingChart: React.FC<TimePricingChartProps> = ({ data }) => {
  // Pull out arrays (or empty)
  const times = data?.timeOfDay ?? [];
  const muls = Array.isArray(data?.priceMultipliers)
    ? data!.priceMultipliers.map((v) => Number(v))
    : [];

  // If we have no valid data, show a placeholder
  if (times.length === 0 || muls.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
        No data available
      </div>
    );
  }

  // Compute min/max and vertical positions (20%–100%)
  const maxV = Math.max(...muls);
  const minV = Math.min(...muls);
  const range = maxV - minV;
  const positions = muls.map((v) =>
    range > 0 ? ((v - minV) / range) * 80 + 20 : 50
  );

  return (
    <div className="h-64 relative overflow-hidden rounded-lg bg-white shadow-md">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-50 rounded-lg" />

      <div className="relative h-full flex flex-col">
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-800">Time-Based Pricing</h3>
        </div>

        <div className="flex-1 p-4 flex items-end space-x-4">
          {times.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="relative w-4 h-4">
                {/* the dot */}
                <div
                  className="absolute w-full h-full bg-purple-600 rounded-full"
                  style={{ bottom: `${positions[i]}%` }}
                />
                {/* value label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">
                  {muls[i].toFixed(2)}×
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center truncate">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimePricingChart;
