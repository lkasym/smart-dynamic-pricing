// src/components/PriceDemandRevenueChart.tsx
import React from 'react';

export type PriceDemandRevenueChartProps = {
  data?: Array<{
    price: number;
    demand: number;
    revenue: number;
  }>;
};

const PriceDemandRevenueChart: React.FC<PriceDemandRevenueChartProps> = ({ data = [] }) => {
  // No data → nice placeholder
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
        No data available
      </div>
    );
  }

  // Extract series
  const prices = data.map((d) => d.price);
  const demands = data.map((d) => d.demand);
  const revenues = data.map((d) => d.revenue);

  const labels = prices.map((p) => `$${p.toFixed(2)}`);
  const maxDemand = Math.max(...demands, 1);
  const maxRevenue = Math.max(...revenues, 1);

  return (
    <div className="h-80 relative overflow-hidden rounded-lg bg-white shadow p-4">
      {/* subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-30 rounded-lg" />
      <div className="relative z-10 flex flex-col h-full">
        {/* legend */}
        <div className="flex justify-center gap-8 mb-2">
          <Legend color="rgba(54,162,235,0.7)" label="Demand" />
          <Legend color="rgba(255,99,132,0.7)" label="Revenue" />
        </div>
        {/* bars */}
        <div className="flex-1 flex items-end h-[calc(100%-2rem)]">
          {data.map((d, i) => {
            const dPct = (d.demand / maxDemand) * 100;
            const rPct = (d.revenue / maxRevenue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="flex items-end w-full h-full space-x-1">
                  <div
                    title={`Demand: ${d.demand}`}
                    className="w-2 rounded-t transition-all duration-700 ease-out"
                    style={{
                      height: `${dPct}%`,
                      backgroundColor: 'rgba(54,162,235,0.7)',
                    }}
                  />
                  <div
                    title={`Revenue: $${d.revenue.toFixed(2)}`}
                    className="w-2 rounded-t transition-all duration-700 ease-out"
                    style={{
                      height: `${rPct}%`,
                      backgroundColor: 'rgba(255,99,132,0.7)',
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 truncate">{labels[i]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center">
    <span
      className="w-3 h-3 rounded-full mr-1"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

export default PriceDemandRevenueChart;
