import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

const imageCache = new Set<string>();

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, placeholder, className, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (imageCache.has(src)) {
      setImgSrc(src);
      setLoaded(true);
      return;
    }
    const handleLoad = () => {
      setImgSrc(src);
      setLoaded(true);
      imageCache.add(src);
    };
    let observer: IntersectionObserver | null = null;
    if (imgRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = new window.Image();
            img.src = src;
            img.onload = handleLoad;
            observer?.disconnect();
          }
        });
      });
      observer.observe(imgRef.current);
      observerRef.current = observer;
    } else {
      // Fallback: すぐロード
      const img = new window.Image();
      img.src = src;
      img.onload = handleLoad;
    }
    return () => {
      observerRef.current?.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      className={className + (loaded ? ' loaded' : ' loading')}
      {...rest}
    />
  );
};

export default LazyImage;
