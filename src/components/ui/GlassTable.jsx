import React from 'react';

export const GlassTable = ({ columns, data, onRowClick, emptyMessage = 'No data available', className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${col.className || ''}`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-600">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`hover:bg-white/[0.02] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
