import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, placeholder, className, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(placeholder || '');

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className + (loaded ? ' loaded' : ' loading')}
      {...rest}
    />
  );
};

export default LazyImage;
