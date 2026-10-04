export type BlobColorId = 'blue' | 'teal' | 'pink' | 'salmon' | 'lime' | 'orange' | 'indigo' | 'slate';

export interface BlobConfig {
  src: string;
  legacySrc: string;
  color: string;
  name: string;
  avatarScale: number; // Scale relative to blob slot (0.0 - 1.0)
  offsetX: number; // Horizontal offset in pixels for perfect optical centering
  offsetY: number; // Vertical offset in pixels for perfect optical centering
}

export const BLOBS: Record<string, BlobConfig> = {
  blue: {
    src: '/assets/blobs/blue-avatar-blob.webp',
    legacySrc: '/color-blob-teal.png',
    color: '#9DBDFD',
    name: 'Blue',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  teal: {
    src: '/assets/blobs/blue-avatar-blob.webp',
    legacySrc: '/color-blob-teal.png',
    color: '#9DBDFD',
    name: 'Teal',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  pink: {
    src: '/assets/blobs/pink-avatar-blob.webp',
    legacySrc: '/color-blob-salmon.png',
    color: '#F9A6D2',
    name: 'Pink',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  salmon: {
    src: '/assets/blobs/pink-avatar-blob.webp',
    legacySrc: '/color-blob-salmon.png',
    color: '#F9A6D2',
    name: 'Salmon',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  lime: {
    src: '/assets/blobs/avatar-blob-5.png',
    legacySrc: '/assets/blobs/avatar-blob-5.png',
    color: '#9AD146',
    name: 'Lime',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  orange: {
    src: '/assets/blobs/avatar-blob-6.png',
    legacySrc: '/assets/blobs/avatar-blob-6.png',
    color: '#FCA246',
    name: 'Orange',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  indigo: {
    src: '/assets/blobs/blue-avatar-blob.webp',
    legacySrc: '/assets/blobs/color-blob-blue.png',
    color: '#8FA8F0',
    name: 'Indigo',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
  slate: {
    src: '/assets/blobs/avatar-blob-4.png',
    legacySrc: '/assets/blobs/avatar-blob-4.png',
    color: '#8D9BB0',
    name: 'Slate',
    avatarScale: 0.62,
    offsetX: 0,
    offsetY: 0,
  },
};

// Scoped page flag to ensure only Profile Creation and Lobby use new blob by default
export const USE_NEW_BLOB_ON_PAGES: Record<string, boolean> = {
  create_profile: true,
  lobby: true,
  home: false,
  guess: false,
  reveal: false,
  scores: false,
  memory: false,
  profile: false,
  invite: false,
};

export function getBlobConfig(blobId?: number | string, avatarId?: number): BlobConfig {
  if (typeof blobId === 'string') {
    const key = blobId.toLowerCase();
    if (BLOBS[key]) return BLOBS[key];
  }
  if (typeof blobId === 'number') {
    if (blobId === 1 || blobId === 4) return BLOBS['pink'];
    if (blobId === 2 || blobId === 3) return BLOBS['blue'];
    if (blobId === 5) return BLOBS['lime'];
    if (blobId === 6) return BLOBS['orange'];
  }
  const safeAvatar = avatarId && avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return safeAvatar === 2 || safeAvatar === 3 ? BLOBS['blue'] : BLOBS['pink'];
}
