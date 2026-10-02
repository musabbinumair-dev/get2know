import React from 'react';

export type BlobShape =
  | 'teardrop'
  | 'starburst'
  | 'starburst-small'
  | 'heart'
  | 'crescent'
  | 'cross'
  | 'card-blob-a'
  | 'card-blob-b';

export type BlobColor = 'pink' | 'yellow' | 'blue' | 'green';

interface BlobProps {
  shape: BlobShape;
  color: BlobColor;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export const Blob: React.FC<BlobProps> = ({
  shape,
  color,
  size,
  className = '',
  style = {},
  alt = `${shape} blob`
}) => {
  const assetPath = `/assets/blobs/${shape}-${color}.svg`;

  const sizeStyle: React.CSSProperties = typeof size === 'number'
    ? { width: `${size}px`, height: `${size}px` }
    : typeof size === 'string' && !size.includes(' ') && size.endsWith('px')
    ? { width: size, height: size }
    : {};

  return (
    <img
      src={assetPath}
      alt={alt}
      className={`select-none pointer-events-none object-contain ${className}`}
      style={{ ...sizeStyle, ...style }}
      draggable={false}
    />
  );
};
