// src/components/BarChart.tsx
import React from 'react';

type BarChartProps = {
  agentRewards: number[];
  baselineRewards: number[];
  options?: any;
};

const BarChart: React.FC<BarChartProps> = ({
  agentRewards,
  baselineRewards,
  options,
}) => {
  // 1) figure out how many episodes we have
  const episodeCount = Math.max(agentRewards.length, baselineRewards.length);

  // 2) build labels: ["Ep 1","Ep 2",…]
  const labels = Array.from({ length: episodeCount }, (_, i) => `Ep ${i + 1}`);

  // 3) wrap into the shape your renderer expects
  const data = {
    labels,
    datasets: [
      {
        label: 'Agent',
        data: agentRewards.slice(0, episodeCount),
        backgroundColor: '#3b82f6',     // blue-500
      },
      {
        label: 'Baseline',
        data: baselineRewards.slice(0, episodeCount),
        backgroundColor: '#10b981',     // green-500
      },
    ],
  };

  // 4) fall back if no data yet
  if (!data.labels.length || data.datasets.every(ds => ds.data.every(v => v === 0))) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0-01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No training data
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Run some episodes to see the chart here.
          </p>
        </div>
      </div>
    );
  }

  // 5) render exactly as before, but feeding in our new `data`
  return (
    <div className="h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-teal-50 opacity-50 rounded-lg" />
      <div className="relative h-full flex flex-col">
        {/* Legend */}
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {data.datasets.map((ds, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-1"
                  style={{ backgroundColor: ds.backgroundColor }}
                />
                <span className="text-xs font-medium">{ds.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bars */}
        <div className="flex-1 p-4">
          <div className="h-full flex items-end">
            {data.labels.map((label, li) => {
              // pick the largest value at this index, to scale heights
              const columnValues = data.datasets.map(ds => ds.data[li] || 0);
              const maxValue = Math.max(...columnValues, 1);
              const barGroupWidth = 100 / data.labels.length;

              return (
                <div
                  key={li}
                  className="flex-1 flex flex-col items-center"
                  style={{ width: `${barGroupWidth}%` }}
                >
                  <div className="w-full flex justify-center items-end h-[85%]">
                    {data.datasets.map((ds, di) => {
                      const value = ds.data[li] || 0;
                      const heightPct = (value / maxValue) * 100;
                      const barWidth = (barGroupWidth / data.datasets.length) * 0.8;

                      return (
                        <div
                          key={di}
                          className="mx-px rounded-t-sm transition-all duration-500 ease-out"
                          style={{
                            height: `${heightPct}%`,
                            width: `${barWidth}%`,
                            backgroundColor: ds.backgroundColor,
                            transformOrigin: 'bottom',
                            animation: 'growUp 0.8s ease-out',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* keyframe for the grow animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes growUp {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
          `,
        }}
      />
    </div>
  );
};

export default BarChart;
