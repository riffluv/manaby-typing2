import React from 'react';
import styles from '@/styles/AppLayout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.appBackground}>
      <div className={styles.centerPanel}>
        {children}
      </div>
    </div>
  );
}
