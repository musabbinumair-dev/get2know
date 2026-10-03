import React from 'react';

export interface ProfileAvatarProps {
  avatarId?: number;
  blobId?: number | string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function getBlobColorName(blobId?: number | string, avatarId?: number): string {
  if (typeof blobId === 'string') {
    const lower = blobId.toLowerCase();
    if (lower === 'salmon') return 'Salmon';
    if (lower === 'teal') return 'Teal';
    if (lower === 'indigo') return 'Indigo';
    if (lower === 'blue') return 'Blue';
    if (lower === 'pink') return 'Pink';
    if (lower === 'slate') return 'Slate';
    if (lower === 'lime') return 'Lime';
    if (lower === 'orange') return 'Orange';
  }
  if (typeof blobId === 'number') {
    if (blobId === 1) return 'Salmon';
    if (blobId === 2) return 'Teal';
    if (blobId === 3) return 'Indigo';
    if (blobId === 4) return 'Pink';
    if (blobId === 5) return 'Lime';
    if (blobId === 6) return 'Orange';
  }
  // Fallback based on avatarId
  const safeAvatar = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  const defaults: Record<number, string> = {
    1: 'Salmon',
    2: 'Teal',
    3: 'Indigo',
    4: 'Pink',
    5: 'Lime',
    6: 'Orange',
  };
  return defaults[safeAvatar] || 'Salmon';
}

export function getBlobImageSrc(blobId?: number | string, avatarId?: number): string {
  if (typeof blobId === 'string') {
    const lower = blobId.toLowerCase();
    if (lower === 'salmon') return '/assets/blobs/avatar-blob-1.png';
    if (lower === 'teal') return '/assets/blobs/avatar-blob-2.png';
    if (lower === 'indigo' || lower === 'blue') return '/assets/blobs/avatar-blob-3.png';
    if (lower === 'pink' || lower === 'slate') return '/assets/blobs/avatar-blob-4.png';
    if (lower === 'lime') return '/assets/blobs/avatar-blob-5.png';
    if (lower === 'orange') return '/assets/blobs/avatar-blob-6.png';
  }
  if (typeof blobId === 'number' && blobId >= 1 && blobId <= 6) {
    return `/assets/blobs/avatar-blob-${blobId}.png`;
  }
  const safeAvatar = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return `/assets/blobs/avatar-blob-${safeAvatar}.png`;
}

export function getAvatarFaceImageSrc(avatarId?: number): string {
  const safeId = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return `/assets/avatars/avatar-${safeId}.png`;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarId = 1,
  blobId,
  size = 97,
  className = '',
  onClick,
}) => {
  const faceSrc = getAvatarFaceImageSrc(avatarId);
  const blobSrc = getBlobImageSrc(blobId, avatarId);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Background Blob */}
      <img
        src={blobSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />
      {/* Character Face */}
      <img
        src={faceSrc}
        alt=""
        className="relative z-10 w-[72%] h-[72%] object-contain pointer-events-none select-none"
        draggable={false}
      />
    </div>
  );
};
