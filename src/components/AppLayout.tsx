import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-background">
      <div className="center-panel">
        {children}
      </div>
    </div>
  );
}
