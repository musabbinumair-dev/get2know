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
    if (lower === 'salmon' || lower === 'pink') return 'Salmon';
    if (lower === 'teal' || lower === 'blue' || lower === 'indigo') return 'Teal';
    if (lower === 'slate') return 'Slate';
    if (lower === 'lime') return 'Lime';
    if (lower === 'orange') return 'Orange';
  }
  if (typeof blobId === 'number') {
    if (blobId === 1 || blobId === 4) return 'Salmon';
    if (blobId === 2 || blobId === 3) return 'Teal';
    if (blobId === 5) return 'Lime';
    if (blobId === 6) return 'Orange';
  }
  // Fallback based on avatarId
  const safeAvatar = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return safeAvatar === 2 || safeAvatar === 3 ? 'Teal' : 'Salmon';
}

export function getBlobImageSrc(blobId?: number | string, avatarId?: number): string {
  if (typeof blobId === 'string') {
    const lower = blobId.toLowerCase();
    if (lower === 'salmon' || lower === 'pink') {
      return '/color-blob-salmon.png';
    }
    if (lower === 'teal' || lower === 'blue' || lower === 'indigo') {
      return '/color-blob-teal.png';
    }
    if (lower === 'lime') return '/assets/blobs/avatar-blob-5.png';
    if (lower === 'orange') return '/assets/blobs/avatar-blob-6.png';
    if (lower === 'slate') return '/assets/blobs/avatar-blob-4.png';
  }
  if (typeof blobId === 'number') {
    if (blobId === 1 || blobId === 4) return '/color-blob-salmon.png';
    if (blobId === 2 || blobId === 3) return '/color-blob-teal.png';
    if (blobId === 5) return '/assets/blobs/avatar-blob-5.png';
    if (blobId === 6) return '/assets/blobs/avatar-blob-6.png';
    return `/assets/blobs/avatar-blob-${blobId}.png`;
  }
  const safeAvatar = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return safeAvatar === 2 || safeAvatar === 3 ? '/color-blob-teal.png' : '/color-blob-salmon.png';
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
      {/* Background Blob chosen by user (Exact home page & profile blob) */}
      <img
        src={blobSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />
      {/* Character Face - Perfectly centered inside blob with safe padding */}
      <div className="relative z-10 w-[62%] h-[62%] flex items-center justify-center pointer-events-none select-none">
        <img
          src={faceSrc}
          alt=""
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>
    </div>
  );
};
