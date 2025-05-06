// src/components/CustomerRetentionChart.tsx

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
  ChartOptions,
  Tick
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// register required chart components
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

interface CustomerRetentionChartProps {
  data?: {
    months: string[];
    retention: number[];
  };
}

const CustomerRetentionChart: React.FC<CustomerRetentionChartProps> = ({ data }) => {
  // fallback data
  const labels = data?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const retention = data?.retention ?? [95, 92, 88, 90, 93, 95];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Customer Retention (%)',
        data: retention,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Customer Retention Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            return typeof val === 'number' ? `${val}%` : '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          // signature matches (value: string|number, index: number, ticks: Tick[]) => string|number
          callback: (value: string | number) => `${value}%`
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="h-64 w-full bg-white rounded-xl shadow-sm p-4">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CustomerRetentionChart;
