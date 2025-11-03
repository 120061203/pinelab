"use client";

import React from "react";

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Admin ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-700 bg-red-50 rounded">發生錯誤，請重試或回到上一頁。</div>;
    }
    return this.props.children;
  }
}


