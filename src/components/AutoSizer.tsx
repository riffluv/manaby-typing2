import * as React from 'react';
import styles from '@/styles/components/AutoSizer.module.css';

interface AutoSizerProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
}

export default function AutoSizer({ children }: AutoSizerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return (
    <div ref={containerRef} className={styles.container}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}
