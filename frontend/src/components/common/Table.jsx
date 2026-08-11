import React from 'react';

export default function Table({ columns = [], data = [], className = '' }) {
  if (!columns.length) return null;

  return (
    <div className={`overflow-x-auto rounded-md border border-slate-200 bg-white ${className}`}>
      <table className="w-full table-auto">
        <thead className="bg-slate-50 text-left text-sm">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-slate-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
                No data
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-slate-50'}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-top text-sm text-ink">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
