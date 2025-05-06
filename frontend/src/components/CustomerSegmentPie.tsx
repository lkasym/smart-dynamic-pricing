// src/components/CustomerRetentionChart.tsx

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Tick,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type CustomerRetentionChartProps = {
  data?: {
    months: string[];
    retention: number[];
  };
};

const CustomerRetentionChart: React.FC<CustomerRetentionChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      fill: boolean;
      tension: number;
      borderWidth: number;
      pointRadius: number;
      backgroundColor: string;
      borderColor: string;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: 'Customer Retention (%)',
        data: [],
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  });

  useEffect(() => {
    const months = data?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const retention = data?.retention ?? [95, 92, 88, 90, 93, 95];

    setChartData({
      labels: months,
      datasets: [
        {
          label: 'Customer Retention (%)',
          data: retention,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
        },
      ],
    });
  }, [data]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: string | number, index: number, ticks: Tick[]) => {
            return `${value}%`;
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div className="h-64 w-full bg-white rounded-xl shadow p-4">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CustomerRetentionChart;
