import React from 'react';
import { Blob, BlobColor, BlobShape } from './Blob';

interface AvatarProps {
  id: 1 | 2 | 3 | 4 | 5 | 6 | number;
  color?: BlobColor;
  size?: number; // Size of the outer container / blob
  className?: string;
  blobShape?: BlobShape;
  showBlob?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  id,
  color = id === 1 ? 'pink' : 'blue',
  size = 140,
  className = '',
  blobShape = id === 1 ? 'card-blob-a' : 'card-blob-b',
  showBlob = true,
}) => {
  const avatarSrc = `/assets/avatars/avatar-${id}.png`;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {showBlob && (
        <Blob
          shape={blobShape}
          color={color}
          size={size}
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}
      <img
        src={avatarSrc}
        alt={`Avatar ${id}`}
        className="relative z-10 w-[78%] h-[78%] object-contain pointer-events-none drop-shadow-none"
        draggable={false}
      />
    </div>
  );
};
