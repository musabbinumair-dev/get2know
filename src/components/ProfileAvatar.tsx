import React from 'react';
import { AvatarBlob } from './AvatarBlob';
import { getBlobConfig } from '../lib/blobs';

export interface ProfileAvatarProps {
  avatarId?: number;
  blobId?: number | string;
  size?: number;
  className?: string;
  useNewBlob?: boolean;
  onClick?: () => void;
}

export function getBlobColorName(blobId?: number | string, avatarId?: number): string {
  const config = getBlobConfig(blobId, avatarId);
  return config.name;
}

export function getBlobImageSrc(blobId?: number | string, avatarId?: number, useNewBlob = true): string {
  const config = getBlobConfig(blobId, avatarId);
  return useNewBlob ? config.src : config.legacySrc;
}

export function getAvatarFaceImageSrc(avatarId?: number): string {
  const safeId = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return `/assets/avatars/avatar-${safeId}.png`;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarId = 1,
  blobId = 'blue',
  size = 97,
  className = '',
  useNewBlob = false,
  onClick,
}) => {
  const config = getBlobConfig(blobId, avatarId);
  const faceSrc = getAvatarFaceImageSrc(avatarId);

  return (
    <AvatarBlob
      color={typeof blobId === 'string' ? blobId : config.name.toLowerCase()}
      size={size}
      useNewBlob={useNewBlob}
      className={className}
      onClick={onClick}
    >
      {/* Character Face - centered on the blob's visible shape */}
      <div
        className="relative z-10 flex items-center justify-center pointer-events-none select-none"
        style={{
          width: `${config.avatarScale * 100}%`,
          height: `${config.avatarScale * 100}%`,
          transform: `translate(${config.offsetX}px, ${config.offsetY}px)`,
        }}
      >
        <img
          src={faceSrc}
          alt=""
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>
    </AvatarBlob>
  );
};
