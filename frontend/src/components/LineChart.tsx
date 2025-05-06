// src/components/LineChart.tsx

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface LineChartProps {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
  /** Optional override for chart height (px) */
  height?: number;
  /** Optional override for chart width (px) */
  width?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  labels,
  datasets,
  height,
  width,
}) => {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      tension: 0.3,
      fill: true,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { padding: 16, boxWidth: 12 },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Episode',
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: {
          display: true,
          text: 'Reward',
          font: { size: 12 },
        },
      },
    },
  };

  // If there's no data yet, show a placeholder
  if (!labels.length || !datasets.length) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">Waiting for data…</p>
      </div>
    );
  }

  return (
    <div
      className="relative bg-white rounded-lg shadow-sm p-4"
      style={{ height: height ?? 300, width: width ?? '100%' }}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
