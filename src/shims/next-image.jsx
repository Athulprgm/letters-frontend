import React from 'react';

export default function Image({
  src,
  alt = '',
  width,
  height,
  fill,
  className,
  priority,
  quality,
  style,
  sizes,
  ...props
}) {
  const combinedStyle = {
    ...(fill
      ? {
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          objectFit: 'cover',
        }
      : {}),
    ...style,
  };

  return (
    <img
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      style={combinedStyle}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
}
