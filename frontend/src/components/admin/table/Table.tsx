import React from 'react';

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-hidden border rounded w-full">
      <table className="w-full table-auto text-sm">{children}</table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 bg-gray-50 border-b">{children}</th>;
}

export function Td({ children, className, style, ...props }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; [key: string]: any }) {
  return (
    <td 
      className={`px-3 py-2 border-b ${className || ''}`}
      style={style}
      {...props}
    >
      {children}
    </td>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-sm py-2">
      <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={() => onPage(page-1)}>上一頁</button>
      <span>
        {page} / {totalPages}
      </span>
      <button className="px-2 py-1 border rounded" disabled={page>=totalPages} onClick={() => onPage(page+1)}>下一頁</button>
    </div>
  );
}


