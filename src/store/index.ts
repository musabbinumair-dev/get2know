import { useState, useEffect } from 'react';

export type PlayerColor = 'salmon' | 'teal' | 'indigo' | 'pink' | 'lime' | 'orange';

export interface PlayerState {
  name: string;
  avatarId: number; // 1 - 6
  color: PlayerColor;
  ready: boolean;
  isHost: boolean;
}

export interface GameSettingsState {
  mode: 'trivia' | 'know-me' | 'mixed';
  categories: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timerSeconds: number | null; // e.g. 10, 20, 30, or null for Off
  rounds: number; // 5, 10, 15
  speedBonus: boolean;
  sound: boolean;
}

export interface LobbyStoreState {
  me: PlayerState;
  friend: PlayerState | null;
  gameSettings: GameSettingsState;
  allTime: { me: number; friend: number };
}

// Initial default state
const initialStoreState: LobbyStoreState = {
  me: {
    name: 'Alex',
    avatarId: 1,
    color: 'salmon',
    ready: false,
    isHost: true,
  },
  friend: {
    name: 'Sam',
    avatarId: 4,
    color: 'teal',
    ready: false,
    isHost: false,
  },
  gameSettings: {
    mode: 'trivia',
    categories: ['Food', 'Movies', 'Music'],
    difficulty: 'Medium',
    timerSeconds: 20,
    rounds: 10,
    speedBonus: true,
    sound: true,
  },
  allTime: {
    me: 7,
    friend: 5,
  },
};

// Global reactive store singleton
let globalState: LobbyStoreState = { ...initialStoreState };
const listeners = new Set<(state: LobbyStoreState) => void>();

function notify() {
  listeners.forEach((listener) => listener(globalState));
}

export const gameStore = {
  getState: (): LobbyStoreState => globalState,

  setState: (updater: (prev: LobbyStoreState) => LobbyStoreState) => {
    globalState = updater(globalState);
    notify();
  },

  setMeReady: (ready: boolean) => {
    globalState = {
      ...globalState,
      me: { ...globalState.me, ready },
    };
    notify();
  },

  setFriendReady: (ready: boolean) => {
    if (!globalState.friend) return;
    globalState = {
      ...globalState,
      friend: { ...globalState.friend, ready },
    };
    notify();
  },

  setMeHost: (isHost: boolean) => {
    globalState = {
      ...globalState,
      me: { ...globalState.me, isHost },
    };
    notify();
  },

  setMeAvatar: (avatarId: number, color?: PlayerColor) => {
    globalState = {
      ...globalState,
      me: {
        ...globalState.me,
        avatarId,
        color: color || globalState.me.color,
      },
    };
    notify();
  },

  setFriendAvatar: (avatarId: number, color?: PlayerColor) => {
    if (!globalState.friend) return;
    globalState = {
      ...globalState,
      friend: {
        ...globalState.friend,
        avatarId,
        color: color || globalState.friend.color,
      },
    };
    notify();
  },

  toggleFriendPresent: () => {
    if (globalState.friend) {
      globalState = { ...globalState, friend: null };
    } else {
      globalState = {
        ...globalState,
        friend: {
          name: 'Sam',
          avatarId: 4,
          color: 'teal',
          ready: false,
          isHost: false,
        },
      };
    }
    notify();
  },

  updateGameSettings: (partial: Partial<GameSettingsState>) => {
    globalState = {
      ...globalState,
      gameSettings: {
        ...globalState.gameSettings,
        ...partial,
      },
    };
    notify();
  },

  toggleCategory: (category: string) => {
    const prev = globalState.gameSettings.categories;
    const next = prev.includes(category)
      ? prev.filter((c) => c !== category)
      : [...prev, category];
    globalState = {
      ...globalState,
      gameSettings: {
        ...globalState.gameSettings,
        categories: next,
      },
    };
    notify();
  },

  reset: () => {
    globalState = { ...initialStoreState };
    notify();
  },
};

// React hook to subscribe to the store
export function useGameStore(): LobbyStoreState {
  const [state, setState] = useState<LobbyStoreState>(globalState);

  useEffect(() => {
    const listener = (newState: LobbyStoreState) => {
      setState(newState);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

// AVATARS image map
export const AVATAR_MAP: Record<
  number,
  { blob: string; face: string; alt: string; defaultColor: PlayerColor }
> = {
  1: {
    blob: '/assets/blobs/avatar-blob-1.png',
    face: '/assets/avatars/avatar-1.png',
    alt: 'Boy with messy hair',
    defaultColor: 'salmon',
  },
  2: {
    blob: '/assets/blobs/avatar-blob-2.png',
    face: '/assets/avatars/avatar-2.png',
    alt: 'Girl with wavy hair and heart clip',
    defaultColor: 'teal',
  },
  3: {
    blob: '/assets/blobs/avatar-blob-3.png',
    face: '/assets/avatars/avatar-3.png',
    alt: 'Boy with round glasses',
    defaultColor: 'indigo',
  },
  4: {
    blob: '/assets/blobs/avatar-blob-4.png',
    face: '/assets/avatars/avatar-4.png',
    alt: 'Girl with top bun',
    defaultColor: 'teal',
  },
  5: {
    blob: '/assets/blobs/avatar-blob-5.png',
    face: '/assets/avatars/avatar-5.png',
    alt: 'Boy with bucket hat',
    defaultColor: 'lime',
  },
  6: {
    blob: '/assets/blobs/avatar-blob-6.png',
    face: '/assets/avatars/avatar-6.png',
    alt: 'Girl with headphones',
    defaultColor: 'orange',
  },
};

export const COLOR_HEX_MAP: Record<PlayerColor, string> = {
  salmon: '#FD8F82',
  teal: '#02CCC3',
  indigo: '#7178FC',
  pink: '#F6739C',
  lime: '#B4E85C',
  orange: '#FFA34F',
};
