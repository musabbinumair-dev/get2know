import React from 'react';
import { getBlobConfig, BlobColorId } from '../lib/blobs';

export interface AvatarBlobProps {
  color?: BlobColorId | string;
  size?: number;
  className?: string;
  useNewBlob?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const AvatarBlob: React.FC<AvatarBlobProps> = ({
  color = 'blue',
  size = 80,
  className = '',
  useNewBlob = true,
  children,
  onClick,
}) => {
  const config = getBlobConfig(color);
  const imageSrc = useNewBlob ? config.src : config.legacySrc;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Dynamic Blob Image from Registry */}
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />
      {children}
    </div>
  );
};
