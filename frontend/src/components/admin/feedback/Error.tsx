import React from 'react';

export default function ErrorBox({ text = '發生錯誤' }: { text?: string }) {
  return <div className="text-sm text-red-600" role="alert">{text}</div>;
}


