// src/components/PriceSensitivityHeatmap.tsx
import React from 'react';

type HeatmapDatum = {
  product: string;
  pricePoints: number[];
  demand: number[];
};

type PriceSensitivityHeatmapProps = {
  /**
   * Array of products with their price points and corresponding demand values.
   * Example: [{ product: 'Headphones', pricePoints: [50,60,...], demand: [120,100,...] }, ...]
   */
  data?: HeatmapDatum[];
};

const PriceSensitivityHeatmap: React.FC<PriceSensitivityHeatmapProps> = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
        No data available
      </div>
    );
  }

  // Flatten points
  const points = data.flatMap(datum =>
    datum.pricePoints.map((price, i) => ({ product: datum.product, x: price, y: datum.demand[i] ?? 0 }))
  );

  // Compute ranges
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Group by product
  const groups = points.reduce<Record<string, typeof points>>((acc, pt) => {
    acc[pt.product] = acc[pt.product] || [];
    acc[pt.product].push(pt);
    return acc;
  }, {} as Record<string, typeof points>);

  // Assign colors
  const productNames = Object.keys(groups);
  const colors: Record<string, string> = {};
  productNames.forEach((name, idx) => {
    const hue = (idx / productNames.length) * 360;
    colors[name] = `hsl(${hue}, 70%, 60%)`;
  });

  return (
    <div className="h-64 relative overflow-hidden rounded-lg bg-white shadow-md">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-orange-50 opacity-30 rounded-lg" />

      <div className="relative h-full p-4 flex flex-col">
        {/* Legend */}
        <div className="flex flex-wrap mb-2">
          {productNames.map(name => (
            <div key={name} className="flex items-center mr-4 mb-1 text-xs">
              <span
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: colors[name] }}
              />
              {name}
            </div>
          ))}
        </div>

        {/* Plot area */}
        <div className="flex-1 relative border-l border-b border-gray-300">
          {points.map((pt, i) => {
            const left = ((pt.x - minX) / rangeX) * 100;
            const bottom = ((pt.y - minY) / rangeY) * 100;
            return (
              <div
                key={i}
                title={`${pt.product}\nPrice: $${pt.x.toFixed(2)}\nDemand: ${pt.y}`}
                className="absolute w-4 h-4 rounded-full -ml-2 -mt-2"
                style={{ left: `${left}%`, bottom: `${bottom}%`, backgroundColor: colors[pt.product], opacity: 0.8 }}
              />
            );
          })}
        </div>

        {/* Axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>${minX.toFixed(2)}</span>
          <span>${maxX.toFixed(2)}</span>
        </div>
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 origin-left text-xs text-gray-500">
          Demand
        </div>
      </div>
    </div>
  );
};

export default PriceSensitivityHeatmap;
