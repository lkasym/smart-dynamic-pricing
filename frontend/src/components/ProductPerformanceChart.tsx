// src/components/ProductPerformanceChart.tsx

import React from 'react';

type Product = {
  name: string;
  current_price: number;
  stock: number;
};

type ProductPerformanceChartProps = {
  products?: Product[];
};

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ products }) => {
  // Placeholder if no data
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg shadow">
        No data available
      </div>
    );
  }

  // Build labels and revenue values
  const labels = products.map((p) => p.name);
  const revenues = products.map((p) => p.current_price * p.stock);
  const maxRevenue = Math.max(...revenues, 1);

  return (
    <div className="h-64 relative overflow-hidden rounded-lg bg-white shadow">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-teal-50 opacity-50 rounded-lg"></div>

      <div className="relative h-full flex flex-col">
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-800">Projected Revenue</h3>
        </div>
        <div className="flex-1 p-4 flex items-end space-x-2">
          {labels.map((label, i) => {
            const rev = revenues[i];
            const heightPct = (rev / maxRevenue) * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-teal-600 rounded-t-lg transition-all duration-500 ease-out flex items-end justify-center"
                  style={{ height: `${heightPct}%` }}
                  title={`$${rev.toFixed(2)}`}
                >
                  <span className="text-xs text-white px-1 pb-1">
                    ${rev.toFixed(0)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-600 truncate w-full text-center">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceChart;
