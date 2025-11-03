import React from 'react';

export default function Loading({ text = '載入中…' }: { text?: string }) {
  return <div className="text-sm text-gray-600" role="status">{text}</div>;
}


