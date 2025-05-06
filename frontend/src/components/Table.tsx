// src/components/Table.tsx
import React from 'react';

export interface Column<T> {
  /** key in your data object */
  key: keyof T;
  /** header label */
  label: string;
  /** optional custom cell renderer */
  render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode;
}

export interface TableProps<T> {
  /** columns definition */
  columns: Column<T>[];
  /** array of row objects */
  data: T[];
  /** optional row click handler */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** extra wrapper classname */
  className?: string;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  className = '',
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={`
                cursor-pointer 
                hover:bg-gray-100 
                ${rowIndex % 2 === 0 ? '' : 'bg-gray-50'}
              `}
            >
              {columns.map((col) => {
                const cell = row[col.key];
                return (
                  <td
                    key={String(col.key)}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                  >
                    {col.render
                      ? col.render(cell, row, rowIndex)
                      : cell != null
                      ? cell.toString()
                      : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
