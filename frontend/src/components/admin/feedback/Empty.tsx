import React from 'react';

export default function Empty({ text = '目前沒有資料' }: { text?: string }) {
  return <div className="text-sm text-gray-500" role="note">{text}</div>;
}


