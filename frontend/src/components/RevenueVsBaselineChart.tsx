// src/components/RevenueVsBaselineChart.tsx
import React from 'react';

type RevenueVsBaselineChartProps = {
  agentRewards: number[];
  baselineRewards: number[];
};

const RevenueVsBaselineChart: React.FC<RevenueVsBaselineChartProps> = ({
  agentRewards = [],
  baselineRewards = []
}) => {
  // If no data at all
  if (agentRewards.length === 0 && baselineRewards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
        No training data available
      </div>
    );
  }

  // Align lengths
  const N = Math.max(agentRewards.length, baselineRewards.length);
  const labels = Array.from({ length: N }, (_, i) => `Ep ${i + 1}`);

  // cumulative sums
  const cumsum = (arr: number[]) =>
    arr.reduce<number[]>((acc, v, i) => {
      const prev = acc[i - 1] ?? 0;
      acc.push(prev + (typeof v === 'number' ? v : 0));
      return acc;
    }, []);
  const aCum = cumsum(agentRewards);
  const bCum = cumsum(baselineRewards);

  // improvement %
  const totalA = aCum[aCum.length - 1] ?? 0;
  const totalB = bCum[bCum.length - 1] ?? 0;
  const improvement = totalB
    ? ((totalA - totalB) / Math.abs(totalB)) * 100
    : 0;

  // chart max for normalization
  const maxVal = Math.max(...aCum, ...bCum, 1);

  // y-axis ticks at 5 steps
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map(t => Math.round(maxVal * t));

  return (
    <div className="h-full relative overflow-hidden rounded-lg bg-white shadow">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 opacity-50 rounded-lg"></div>

      <div className="relative h-full flex flex-col">
        {/* Legend + improvement */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 bg-teal-600 rounded-full" />
              <span>AI Agent</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 bg-pink-600 rounded-full" />
              <span>Baseline</span>
            </div>
          </div>
          <div
            className={`text-sm font-semibold ${
              improvement >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            Improvement: {improvement.toFixed(2)}%
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 flex relative">
          {/* Y-axis labels */}
          <div className="w-12 flex flex-col justify-between text-xs text-gray-500 px-2">
            {yTicks.map((val, i) => (
              <span key={i}>${val}</span>
            ))}
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end overflow-x-auto px-2">
            {labels.map((lbl, i) => {
              const aH = (aCum[i] ?? 0) / maxVal * 100;
              const bH = (bCum[i] ?? 0) / maxVal * 100;
              return (
                <div key={i} className="flex flex-col items-center mx-1">
                  <div className="flex items-end space-x-0.5">
                    <div
                      className="w-1 bg-teal-600 rounded-t animate-growUp"
                      style={{ height: `${aH}%` }}
                      title={`Agent: $${aCum[i]?.toFixed(0)}`}
                    />
                    <div
                      className="w-1 bg-pink-600 rounded-t animate-growUp"
                      style={{ height: `${bH}%` }}
                      title={`Baseline: $${bCum[i]?.toFixed(0)}`}
                    />
                  </div>
                  {/* label every 10th */}
                  {i % 10 === 0 && (
                    <span className="mt-1 text-xs text-gray-600">{lbl}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* growUp keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes growUp {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
            .animate-growUp { animation: growUp 0.8s ease-out forwards; transform-origin: bottom; }
          `
        }}
      />
    </div>
  );
};

export default RevenueVsBaselineChart;
