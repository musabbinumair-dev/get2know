import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '../services/sessionContext';
import { useGameSession } from '../services/gameSessionContext';
import { usePageVisible } from '../context/PageVisibilityContext';
import { AVATAR_OPTIONS } from '../screens/CreateProfileScreen';

interface SpecItem {
  key: string;
  name: string;
  file?: string;
  type: 'image' | 'slot' | 'text' | 'box';
  cx: number;
  cy: number;
  w: number;
  h: number;
  snap?: string;
  refFontSize?: number;
  refWeight?: number;
  refFitWidth?: number;
  refColor?: string;
  zIndex: number;
}

// ── DYNAMIC AVATAR & BLOB RESOLVER FROM PROFILE CREATING PAGE ──
export function getAvatarFromProfile(avatarId?: number, color?: string) {
  const matched = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];

  let blobSrc = matched.blob;
  if (color === 'salmon' || color === 'pink') {
    blobSrc = '/assets/blobs/avatar-blob-1.png';
  } else if (color === 'teal' || color === 'cyan') {
    blobSrc = '/assets/blobs/avatar-blob-2.png';
  } else if (color === 'indigo' || color === 'blue') {
    blobSrc = '/assets/blobs/avatar-blob-3.png';
  } else if (color === 'slate') {
    blobSrc = '/assets/blobs/avatar-blob-4.png';
  } else if (color === 'lime') {
    blobSrc = '/assets/blobs/avatar-blob-5.png';
  } else if (color === 'orange') {
    blobSrc = '/assets/blobs/avatar-blob-6.png';
  }

  return {
    blob: blobSrc,
    face: matched.face,
    alt: matched.alt,
  };
}

export const COUNTDOWN_SPECS: SpecItem[] = [
  // 1. Static Images from manifest (low to high z-order)
  {
    key: 'deco-crescent-yellow-top-left',
    name: 'deco-crescent-yellow-top-left-cropped.webp',
    file: '/countdown/deco-crescent-yellow-top-left-cropped.webp',
    type: 'image',
    cx: 63.2 / 2,
    cy: 82.9 / 2,
    w: 63.2,
    h: 82.9,
    snap: 'left top',
    zIndex: 1,
  },
  {
    key: 'deco-heart-pink-top-right',
    name: 'deco-heart-pink-top-right-cropped.webp',
    file: '/countdown/deco-heart-pink-top-right-cropped.webp',
    type: 'image',
    cx: 329.6 + 60.4 / 2,
    cy: 16.5 + 65.9 / 2,
    w: 60.4,
    h: 65.9,
    snap: 'right',
    zIndex: 1,
  },
  {
    key: 'deco-star-blue-top-right',
    name: 'deco-star-blue-top-right.webp',
    file: '/countdown/deco-star-blue-top-right.webp',
    type: 'image',
    cx: 284.3 + 65.5 / 2, // 317.05
    cy: 124.5 + 67.3 / 2, // 158.15
    w: 65.5,
    h: 67.3,
    zIndex: 2,
  },
  {
    key: 'deco-star-blue-left',
    name: 'deco-star-blue-left.webp',
    file: '/countdown/deco-star-blue-left.webp',
    type: 'image',
    cx: 23.3 + 60.9 / 2, // 53.75
    cy: 353.4 + 64.5 / 2, // 385.65
    w: 60.9,
    h: 64.5,
    zIndex: 2,
  },
  {
    key: 'deco-cross-olive-right',
    name: 'deco-cross-olive-right.webp',
    file: '/countdown/deco-cross-olive-right.webp',
    type: 'image',
    cx: 319 + 60.4 / 2, // 349.2
    cy: 346.5 + 66.4 / 2, // 379.7
    w: 60.4,
    h: 66.4,
    zIndex: 2,
  },
  {
    key: 'deco-sparks-yellow-around-number',
    name: 'deco-sparks-yellow-around-number.webp',
    file: '/countdown/deco-sparks-yellow-around-number.webp',
    type: 'image',
    cx: 22.9 + 348.8 / 2, // 197.3
    cy: 153.3 + 167.5 / 2, // 237.05
    w: 348.8,
    h: 167.5,
    zIndex: 3,
  },
  {
    key: 'countdown-blob-pink-behind-number',
    name: 'countdown-blob-pink-behind-number.webp',
    file: '/countdown/countdown-blob-pink-behind-number.webp',
    type: 'image',
    cx: 76.9 + 237.1 / 2, // 195.45
    cy: 152.4 + 253.1 / 2, // 278.95
    w: 237.1,
    h: 253.1,
    zIndex: 4,
  },
  {
    key: 'deco-sparks-yellow-around-players',
    name: 'deco-sparks-yellow-around-players.webp',
    file: '/countdown/deco-sparks-yellow-around-players.webp',
    type: 'image',
    cx: 9.6 + 370.3 / 2, // 194.75
    cy: 597.4 + 65.0 / 2, // 629.9
    w: 370.3,
    h: 65.0,
    zIndex: 5,
  },
  {
    key: 'deco-star-blue-bottom-left',
    name: 'deco-star-blue-bottom-left-cropped.webp',
    file: '/countdown/deco-star-blue-bottom-left-cropped.webp',
    type: 'image',
    cx: 74.6 / 2,
    cy: 83.8 / 2,
    w: 74.6,
    h: 83.8,
    snap: 'left bottom',
    zIndex: 6,
  },
  {
    key: 'deco-cross-olive-bottom-right',
    name: 'deco-cross-olive-bottom-right.webp',
    file: '/countdown/deco-cross-olive-bottom-right.webp',
    type: 'image',
    cx: 315.4 + 69.1 / 2, // 349.95
    cy: 766.7 + 76.4 / 2,
    w: 69.1,
    h: 76.4,
    snap: 'bottom',
    zIndex: 6,
  },

  // 2. Avatar Row (mockup exact centers)
  // ME slot center: (102.9, 619.5), 124x122
  {
    key: 'player-me-slot',
    name: 'Player ME slot (Alex)',
    type: 'slot',
    cx: 102.9,
    cy: 619.5,
    w: 124,
    h: 122,
    zIndex: 10,
  },
  // FRIEND slot center: (287.4, 623.7), 124x122
  {
    key: 'player-friend-slot',
    name: 'Player FRIEND slot (Sam)',
    type: 'slot',
    cx: 287.4,
    cy: 623.7,
    w: 124,
    h: 122,
    zIndex: 10,
  },

  // 3. Badge VS Starburst (center: 195.4, 628.7, size: 81.5x77.4)
  {
    key: 'badge-vs-starburst-yellow',
    name: 'badge-vs-starburst-yellow.webp',
    file: '/countdown/badge-vs-starburst-yellow.webp',
    type: 'image',
    cx: 195.4,
    cy: 628.7,
    w: 81.5,
    h: 77.4,
    zIndex: 15,
  },

  // 4. Pill container box (cx: 194.8, cy: 80.7, 158.6x33.4)
  {
    key: 'pill-box',
    name: 'Pill cream box',
    type: 'box',
    cx: 194.8,
    cy: 64 + 33.4 / 2, // 80.7
    w: 158.6,
    h: 33.4,
    zIndex: 8,
  },

  // 5. Texts (anchored at center x, y)
  {
    key: 'text-pill',
    name: 'Pill text',
    type: 'text',
    cx: 194.8,
    cy: 81,
    w: 123.1,
    h: 14.3,
    refFontSize: 14.3,
    refWeight: 800,
    refFitWidth: 123.1,
    refColor: '#1D1F23',
    zIndex: 20,
  },
  {
    key: 'text-number',
    name: 'Number (3/2/1/Go!)',
    type: 'text',
    cx: 194.8,
    cy: 289.2,
    w: 115.8,
    h: 214,
    refFontSize: 214,
    refWeight: 900,
    refFitWidth: 115.8,
    refColor: '#1D1F23',
    zIndex: 25,
  },
  {
    key: 'text-get-ready',
    name: 'Get ready!',
    type: 'text',
    cx: 194.8,
    cy: 467.6,
    w: 227.5,
    h: 46.5,
    refFontSize: 46.5,
    refWeight: 900,
    refFitWidth: 227.5,
    refColor: '#1D1F23',
    zIndex: 20,
  },
  {
    key: 'text-sub-ready',
    name: 'First question coming up',
    type: 'text',
    cx: 194.8,
    cy: 509.1,
    w: 207,
    h: 17.6,
    refFontSize: 17.6,
    refWeight: 700,
    refFitWidth: 207,
    refColor: '#767576',
    zIndex: 20,
  },
  {
    key: 'text-vs',
    name: 'VS text',
    type: 'text',
    cx: 195.2,
    cy: 631.6,
    w: 32.5,
    h: 26,
    refFontSize: 26,
    refWeight: 900,
    refFitWidth: 32.5,
    refColor: '#1D1F23',
    zIndex: 26,
  },
  {
    key: 'text-name-me',
    name: 'Player ME name (Alex)',
    type: 'text',
    cx: 102.8,
    cy: 702.5,
    w: 39.8,
    h: 19,
    refFontSize: 19,
    refWeight: 900,
    refFitWidth: 39.8,
    refColor: '#1D1F23',
    zIndex: 20,
  },
  {
    key: 'text-name-friend',
    name: 'Player FRIEND name (Sam)',
    type: 'text',
    cx: 288.9,
    cy: 702.5,
    w: 38.5,
    h: 19,
    refFontSize: 19,
    refWeight: 900,
    refFitWidth: 38.5,
    refColor: '#1D1F23',
    zIndex: 20,
  },
];

export interface CountdownScreenProps {
  onCountdownComplete?: () => void;
  initialMe?: { name: string; avatarId: number; color?: string };
  initialFriend?: { name: string; avatarId: number; color?: string };
  initialMode?: 'Trivia' | 'Know Me' | 'Mixed';
  initialRounds?: number;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  onCountdownComplete,
  initialMe,
  initialFriend,
  initialMode,
  initialRounds,
}) => {
  const location = useLocation();
  const { profile } = useSession();

  // ── URL PARAMETERS FOR DEBUG MODE: ONLY SHOW DEV BAR IF ?debug=1 ──
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isDebugParam = searchParams.get('debug') === '1';
  const [debugPanelOpen, setDebugPanelOpen] = useState<boolean>(false);

  // ── DYNAMIC APP STATE WITH DEFAULTS ──
  const [me, setMe] = useState(() => {
    if (initialMe) return initialMe;
    return {
      name: profile?.name && profile.name !== 'Player 1' ? profile.name : 'Alex',
      avatarId: profile?.avatarId ?? 1,
      color: profile?.color || 'salmon',
    };
  });

  const [friend, setFriend] = useState(() => {
    if (initialFriend) return initialFriend;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partner_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.name !== 'Alex') {
            return {
              name: parsed.name,
              avatarId: parsed.avatarId ?? 2,
              color: parsed.color || 'teal',
            };
          }
        } catch {}
      }
    }
    return { name: 'Sam', avatarId: 2, color: 'teal' };
  });

  const [mode, setMode] = useState<'Trivia' | 'Know Me' | 'Mixed'>(() => {
    if (initialMode) return initialMode;
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('gty_game_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.mode === 'know-me') return 'Know Me';
          if (parsed.mode === 'mixed') return 'Mixed';
          return 'Trivia';
        } catch {}
      }
    }
    return 'Trivia';
  });

  const [rounds, setRounds] = useState<number>(() => {
    if (initialRounds) return initialRounds;
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('gty_game_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.rounds) return parsed.rounds;
        } catch {}
      }
    }
    return 10;
  });

  // ── NEW RESPONSIVE RULE ENGINE ──
  // vw = min(viewport width, 430) (centered if wider), vh = visualViewport height
  // sx = vw/390, sy = vh/844, u = min(sx, sy)
  const [dimensions, setDimensions] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 390;
    const h =
      typeof window !== 'undefined' && window.visualViewport
        ? window.visualViewport.height
        : typeof window !== 'undefined'
        ? window.innerHeight
        : 844;
    const vw = Math.min(w, 430);
    const vh = h;
    const sx = vw / 390;
    const sy = vh / 844;
    const u = Math.min(sx, sy);
    return { vw, vh, sx, sy, u, windowW: w };
  });

  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const vw = Math.min(w, 430);
    const vh = h;
    const sx = vw / 390;
    const sy = vh / 844;
    const u = Math.min(sx, sy);
    setDimensions({ vw, vh, sx, sy, u, windowW: w });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [handleResize]);

  // ── FIXED SCREEN: LOCK BODY & HTML SCROLL & OVERSCROLL ──
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const origBodyOverscroll = document.body.style.overscrollBehavior;
    const origHtmlTouchAction = document.documentElement.style.touchAction;
    const origBodyTouchAction = document.body.style.touchAction;
    const origBodyBg = document.body.style.backgroundColor;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.touchAction = 'none';
    document.body.style.touchAction = 'none';
    document.documentElement.style.backgroundColor = '#FDE776';
    document.body.style.backgroundColor = '#FDE776';

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overscrollBehavior = origHtmlOverscroll;
      document.body.style.overscrollBehavior = origBodyOverscroll;
      document.documentElement.style.touchAction = origHtmlTouchAction;
      document.body.style.touchAction = origBodyTouchAction;
      document.body.style.backgroundColor = origBodyBg;
    };
  }, []);

  // ── FONT LOAD DETECTION FOR PERFECT TEXT FIT ──
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // ── COUNTDOWN STEP SEQUENCE: 3 -> 2 -> 1 -> Go! (0.8s each) ──
  const [step, setStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('play') === '1' || p.get('autoplay') === '1') return false;
      if (p.get('debug') === '1') return true;
    }
    return false;
  });

  const { startNewGame } = useGameSession();

  const handleCountdownDone = useCallback(() => {
    if (onCountdownComplete) {
      onCountdownComplete();
    } else {
      startNewGame(mode, rounds);
    }
  }, [onCountdownComplete, startNewGame, mode, rounds]);

  const isPageVisible = usePageVisible();
  const [countdownStarted, setCountdownStarted] = useState<boolean>(false);

  // When loader has completely faded out and page is fully visible, start countdown
  useEffect(() => {
    if (isPageVisible && !countdownStarted) {
      setStep(0);
      setCountdownStarted(true);
    }
  }, [isPageVisible, countdownStarted]);

  // Step advancement timer (0.8s per step) - strictly starts ONLY when page is visible and loader is completely hidden
  useEffect(() => {
    if (isPaused || !isPageVisible || !countdownStarted) return;

    if (step < 3) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Step 3 is "Go!"
      const finishTimer = setTimeout(() => {
        handleCountdownDone();
      }, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [step, isPaused, isPageVisible, countdownStarted, handleCountdownDone]);

  // Restart countdown
  const handleRestart = useCallback(() => {
    setStep(0);
    setIsPaused(false);
  }, []);

  // Skip countdown
  const handleSkip = useCallback(() => {
    handleCountdownDone();
  }, [handleCountdownDone]);

  // ── TEXT VALUES & FORMATTING ──
  const isDefaultPillText = mode === 'Trivia' && rounds === 10;
  const pillText = `${mode} · ${rounds} rounds`;

  const isDefaultMeName = me.name === 'Alex';
  const isDefaultFriendName = friend.name === 'Sam';
  const displayMeName = me.name.length > 10 ? me.name.slice(0, 10) + '…' : me.name;
  const displayFriendName = friend.name.length > 10 ? friend.name.slice(0, 10) + '…' : friend.name;

  const stepNumberText = step === 0 ? '3' : step === 1 ? '2' : step === 2 ? '1' : 'Go!';
  const headlineText = 'Get ready!';
  const subtitleText = step === 3 ? 'Here we go!' : 'First question coming up';

  // ── MEASURE UNROUNDED TEXT WIDTHS FOR FIT ──
  const pillMeasureRef = useRef<HTMLSpanElement | null>(null);
  const numMeasureRef = useRef<HTMLSpanElement | null>(null);
  const getReadyMeasureRef = useRef<HTMLSpanElement | null>(null);
  const subReadyMeasureRef = useRef<HTMLSpanElement | null>(null);
  const vsMeasureRef = useRef<HTMLSpanElement | null>(null);
  const meNameMeasureRef = useRef<HTMLSpanElement | null>(null);
  const friendNameMeasureRef = useRef<HTMLSpanElement | null>(null);

  const [textWidths, setTextWidths] = useState<Record<string, number>>({});

  const measureAllTexts = useCallback(() => {
    const widths: Record<string, number> = {};
    if (pillMeasureRef.current) widths['pill'] = pillMeasureRef.current.getBoundingClientRect().width;
    if (numMeasureRef.current) widths['number'] = numMeasureRef.current.getBoundingClientRect().width;
    if (getReadyMeasureRef.current) widths['getReady'] = getReadyMeasureRef.current.getBoundingClientRect().width;
    if (subReadyMeasureRef.current) widths['subReady'] = subReadyMeasureRef.current.getBoundingClientRect().width;
    if (vsMeasureRef.current) widths['vs'] = vsMeasureRef.current.getBoundingClientRect().width;
    if (meNameMeasureRef.current) widths['meName'] = meNameMeasureRef.current.getBoundingClientRect().width;
    if (friendNameMeasureRef.current) widths['friendName'] = friendNameMeasureRef.current.getBoundingClientRect().width;
    setTextWidths(widths);
  }, []);

  useEffect(() => {
    measureAllTexts();
  }, [dimensions, fontsLoaded, step, pillText, displayMeName, displayFriendName, measureAllTexts]);

  // Compute scaleX for fit
  const getScaleX = (key: string, targetRefPx: number, isEligible: boolean): number => {
    if (!isEligible) return 1;
    const measured = textWidths[key];
    if (!measured || measured <= 0) return 1;
    const targetWidth = targetRefPx * dimensions.u;
    return targetWidth / measured;
  };

  const pillScaleX = getScaleX('pill', 123.1, isDefaultPillText);
  const numberScaleX = getScaleX('number', 115.8, step === 0);
  const getReadyScaleX = getScaleX('getReady', 227.5, true);
  const subReadyScaleX = getScaleX('subReady', 207, step < 3);
  const vsScaleX = getScaleX('vs', 32.5, true);
  const meNameScaleX = getScaleX('meName', 39.8, isDefaultMeName);
  const friendNameScaleX = getScaleX('friendName', 38.5, isDefaultFriendName);

  const pillBoxWidth = useMemo(() => {
    if (isDefaultPillText) return 158.6 * dimensions.u;
    const measured = textWidths['pill'] || 123.1 * dimensions.u;
    return measured + 36 * dimensions.u;
  }, [isDefaultPillText, textWidths, dimensions.u]);

  // ── POSITION CALCULATION HELPER FUNCTIONS ──
  // X = vw/2 + (cx - 195) * u
  // Y = cy * sy
  const { sx, sy, u, vw, vh, windowW } = dimensions;

  const getCenterX = useCallback(
    (cx: number) => vw / 2 + (cx - 195) * u,
    [vw, u]
  );
  const getCenterY = useCallback((cy: number) => cy * sy, [sy]);

  // ── REFS FOR DEV DIAGNOSTICS & ELEMENT BOUNDING CHECKS ──
  const stageRef = useRef<HTMLDivElement | null>(null);
  const elemRefs = useRef<Record<string, HTMLElement | null>>({});

  const [diagnostics, setDiagnostics] = useState<Array<{
    key: string;
    name: string;
    type: string;
    expectedCenterX: number;
    expectedCenterY: number;
    expectedW: number;
    expectedH: number;
    measuredCenterX: number;
    measuredCenterY: number;
    measuredW: number;
    measuredH: number;
    diffCenterX: number;
    diffCenterY: number;
    diffW: number;
    diffH: number;
    pass: boolean;
  }>>([]);

  const runDiagnostics = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();

    const list: typeof diagnostics = [];

    for (const spec of COUNTDOWN_SPECS) {
      const el = elemRefs.current[spec.key];
      if (!el) continue;
      const r = el.getBoundingClientRect();

      let expW = spec.w * u;
      let expH = spec.h * u;
      let expCenterX = getCenterX(spec.cx);
      let expCenterY = getCenterY(spec.cy);

      if (spec.key === 'pill-box') {
        expW = pillBoxWidth;
        expH = 33.4 * u;
      } else if (spec.snap === 'left top') {
        expCenterX = expW / 2;
        expCenterY = expH / 2;
      } else if (spec.snap === 'right') {
        expCenterX = vw - expW / 2;
      } else if (spec.snap === 'left bottom') {
        expCenterX = expW / 2;
        expCenterY = vh - expH / 2;
      } else if (spec.snap === 'bottom') {
        expCenterY = vh - expH / 2;
      } else if (spec.type === 'text') {
        const isEligible =
          spec.key === 'text-pill'
            ? isDefaultPillText
            : spec.key === 'text-number'
            ? step === 0
            : spec.key === 'text-sub-ready'
            ? step < 3
            : spec.key === 'text-name-me'
            ? isDefaultMeName
            : spec.key === 'text-name-friend'
            ? isDefaultFriendName
            : true;

        expW = isEligible && spec.refFitWidth ? spec.refFitWidth * u : r.width;
        expH = r.height;
      }

      const measCenterX = r.left - stageRect.left + r.width / 2;
      const measCenterY = r.top - stageRect.top + r.height / 2;
      const measW = r.width;
      const measH = r.height;

      const diffCenterX = Math.abs(measCenterX - expCenterX);
      const diffCenterY = Math.abs(measCenterY - expCenterY);
      const diffW = Math.abs(measW - expW);
      const diffH = Math.abs(measH - expH);

      const pass =
        diffCenterX <= 1.05 &&
        diffCenterY <= 1.05 &&
        diffW <= 1.05 &&
        (spec.type === 'text' || diffH <= 1.05);

      list.push({
        key: spec.key,
        name: spec.name,
        type: spec.type,
        expectedCenterX: expCenterX,
        expectedCenterY: expCenterY,
        expectedW: expW,
        expectedH: expH,
        measuredCenterX: measCenterX,
        measuredCenterY: measCenterY,
        measuredW: measW,
        measuredH: measH,
        diffCenterX,
        diffCenterY,
        diffW,
        diffH,
        pass,
      });
    }

    setDiagnostics(list);
  }, [getCenterX, getCenterY, pillBoxWidth, isDefaultPillText, step, isDefaultMeName, isDefaultFriendName, u, vw, vh]);

  useEffect(() => {
    if (isDebugParam && debugPanelOpen) {
      const timer = setTimeout(runDiagnostics, 100);
      return () => clearTimeout(timer);
    }
  }, [isDebugParam, debugPanelOpen, runDiagnostics, dimensions, step, textWidths]);

  // Render a player avatar: dynamically from profile creating page (exact blob + face)
  const renderPlayerAvatar = (avatarId: number, color?: string, name?: string) => {
    const avatar = getAvatarFromProfile(avatarId, color);

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Dynamic Avatar Blob from Profile Creating page */}
        <img
          src={avatar.blob}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
        {/* Dynamic Avatar Face from Profile Creating page */}
        <img
          src={avatar.face}
          alt={avatar.alt || name || ''}
          style={{
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            width: '74%',
            height: '74%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 w-full h-full select-none overflow-hidden touch-none"
      style={{
        backgroundColor: '#FDE776',
        overscrollBehavior: 'none',
        touchAction: 'none',
      }}
    >
      <style>{`
        @keyframes countdown-number-tick {
          0% { transform: scale(0.6); opacity: 0; }
          52.5% { transform: scale(1.08); opacity: 1; }
          65% { transform: scale(1); opacity: 1; }
          81.25% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .countdown-anim-number {
            animation: countdown-fade-only 0.8s forwards !important;
          }
        }
        @keyframes countdown-fade-only {
          0% { opacity: 0; }
          40% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ── HIDDEN MEASUREMENT CONTAINER TO COMPUTE ACTUAL UNROUNDED TEXT WIDTHS ── */}
      <div
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        <span
          ref={pillMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: `${14.3 * u}px`,
          }}
        >
          {pillText}
        </span>
        <span
          ref={numMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${(step === 3 ? 120 : 214) * u}px`,
          }}
        >
          {stepNumberText}
        </span>
        <span
          ref={getReadyMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${46.5 * u}px`,
          }}
        >
          {headlineText}
        </span>
        <span
          ref={subReadyMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: `${17.6 * u}px`,
          }}
        >
          {subtitleText}
        </span>
        <span
          ref={vsMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${26 * u}px`,
          }}
        >
          VS
        </span>
        <span
          ref={meNameMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${19 * u}px`,
          }}
        >
          {displayMeName}
        </span>
        <span
          ref={friendNameMeasureRef}
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${19 * u}px`,
          }}
        >
          {displayFriendName}
        </span>
      </div>

      {/* ── STAGE WRAPPER: EXACT vw x vh (CENTERED IF WINDOW > 430) ── */}
      <div
        ref={stageRef}
        style={{
          position: 'absolute',
          left: `${Math.max(0, (windowW - vw) / 2)}px`,
          top: 0,
          width: `${vw}px`,
          height: `${vh}px`,
          backgroundColor: '#FDE776',
          overflow: 'hidden',
          touchAction: 'none',
          overscrollBehavior: 'none',
        }}
      >
        {/* ── 1. ASSET: Yellow Crescent Top-Left (Snap left + top) ── */}
        <img
          ref={(el) => { elemRefs.current['deco-crescent-yellow-top-left'] = el; }}
          src="/countdown/deco-crescent-yellow-top-left-cropped.webp"
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${63.2 * u}px`,
            height: `${82.9 * u}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* ── 2. ASSET: Pink Heart Top-Right (Snap right) ── */}
        <img
          ref={(el) => { elemRefs.current['deco-heart-pink-top-right'] = el; }}
          src="/countdown/deco-heart-pink-top-right-cropped.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${vw - 60.4 * u}px`,
            top: `${getCenterY(16.5 + 65.9 / 2) - (65.9 * u) / 2}px`,
            width: `${60.4 * u}px`,
            height: `${65.9 * u}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* ── 3. ASSET: Blue Star Top-Right ── */}
        <div
          ref={(el) => { elemRefs.current['deco-star-blue-top-right'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(284.3 + 65.5 / 2) - (65.5 * u) / 2}px`,
            top: `${getCenterY(124.5 + 67.3 / 2) - (67.3 * u) / 2}px`,
            width: `${65.5 * u}px`,
            height: `${67.3 * u}px`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/countdown/deco-star-blue-top-right.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ── 4. ASSET: Blue Star Left ── */}
        <div
          ref={(el) => { elemRefs.current['deco-star-blue-left'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(23.3 + 60.9 / 2) - (60.9 * u) / 2}px`,
            top: `${getCenterY(353.4 + 64.5 / 2) - (64.5 * u) / 2}px`,
            width: `${60.9 * u}px`,
            height: `${64.5 * u}px`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/countdown/deco-star-blue-left.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ── 5. ASSET: Olive Cross Right ── */}
        <div
          ref={(el) => { elemRefs.current['deco-cross-olive-right'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(319 + 60.4 / 2) - (60.4 * u) / 2}px`,
            top: `${getCenterY(346.5 + 66.4 / 2) - (66.4 * u) / 2}px`,
            width: `${60.4 * u}px`,
            height: `${66.4 * u}px`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/countdown/deco-cross-olive-right.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ── 6. ASSET: Yellow Sparks around Number ── */}
        <div
          ref={(el) => { elemRefs.current['deco-sparks-yellow-around-number'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(22.9 + 348.8 / 2) - (348.8 * u) / 2}px`,
            top: `${getCenterY(153.3 + 167.5 / 2) - (167.5 * u) / 2}px`,
            width: `${348.8 * u}px`,
            height: `${167.5 * u}px`,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/countdown/deco-sparks-yellow-around-number.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ── 7. ASSET: Big Pink Blob behind Number ── */}
        <div
          ref={(el) => { elemRefs.current['countdown-blob-pink-behind-number'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(76.9 + 237.1 / 2) - (237.1 * u) / 2}px`,
            top: `${getCenterY(152.4 + 253.1 / 2) - (253.1 * u) / 2}px`,
            width: `${237.1 * u}px`,
            height: `${253.1 * u}px`,
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/countdown/countdown-blob-pink-behind-number.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ── 8. ASSET: Yellow Sparks around Players (Center cx: 194.75, cy: 629.9, size: 370.3x65.0) ── */}
        <img
          ref={(el) => { elemRefs.current['deco-sparks-yellow-around-players'] = el; }}
          src="/countdown/deco-sparks-yellow-around-players.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${getCenterX(9.6 + 370.3 / 2) - (370.3 * u) / 2}px`,
            top: `${getCenterY(597.4 + 65.0 / 2) - (65.0 * u) / 2}px`,
            width: `${370.3 * u}px`,
            height: `${65.0 * u}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 5,
          }}
          draggable={false}
        />

        {/* ── 9. ASSET: Blue Star Bottom-Left (Snap left + bottom) ── */}
        <img
          ref={(el) => { elemRefs.current['deco-star-blue-bottom-left'] = el; }}
          src="/countdown/deco-star-blue-bottom-left-cropped.webp"
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            top: `${vh - 83.8 * u}px`,
            width: `${74.6 * u}px`,
            height: `${83.8 * u}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 6,
          }}
          draggable={false}
        />

        {/* ── 10. ASSET: Olive Cross Bottom-Right (Snap bottom) ── */}
        <img
          ref={(el) => { elemRefs.current['deco-cross-olive-bottom-right'] = el; }}
          src="/countdown/deco-cross-olive-bottom-right.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${getCenterX(315.4 + 69.1 / 2) - (69.1 * u) / 2}px`,
            top: `${vh - 76.4 * u}px`,
            width: `${69.1 * u}px`,
            height: `${76.4 * u}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 6,
          }}
          draggable={false}
        />

        {/* ── 11. PLAYER ME SLOT: Center (102.9, 619.5), size 124x122 ── */}
        <div
          ref={(el) => { elemRefs.current['player-me-slot'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(102.9) - (124 * u) / 2}px`,
            top: `${getCenterY(619.5) - (122 * u) / 2}px`,
            width: `${124 * u}px`,
            height: `${122 * u}px`,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {renderPlayerAvatar(me.avatarId, me.color, displayMeName)}
        </div>

        {/* ── 12. PLAYER FRIEND SLOT: Center (287.4, 623.7), size 124x122 ── */}
        <div
          ref={(el) => { elemRefs.current['player-friend-slot'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(287.4) - (124 * u) / 2}px`,
            top: `${getCenterY(623.7) - (122 * u) / 2}px`,
            width: `${124 * u}px`,
            height: `${122 * u}px`,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {renderPlayerAvatar(friend.avatarId, friend.color, displayFriendName)}
        </div>

        {/* ── 13. ASSET: Badge VS Starburst: Center (195.4, 628.7), size 81.5x77.4 ── */}
        <div
          ref={(el) => { elemRefs.current['badge-vs-starburst-yellow'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(195.4) - (81.5 * u) / 2}px`,
            top: `${getCenterY(628.7) - (77.4 * u) / 2}px`,
            width: `${81.5 * u}px`,
            height: `${77.4 * u}px`,
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/countdown/badge-vs-starburst-yellow.webp"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            draggable={false}
          />
        </div>

        {/* ── 14. PILL CREAM CONTAINER BOX ── */}
        <div
          ref={(el) => { elemRefs.current['pill-box'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(194.8) - pillBoxWidth / 2}px`,
            top: `${getCenterY(64 + 33.4 / 2) - (33.4 * u) / 2}px`,
            width: `${pillBoxWidth}px`,
            height: `${33.4 * u}px`,
            backgroundColor: '#F8F2E3',
            borderRadius: '9999px',
            zIndex: 8,
            pointerEvents: 'none',
          }}
        />

        {/* ── 15. PILL TEXT (Centered at 194.8, 81) ── */}
        <div
          ref={(el) => { elemRefs.current['text-pill'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(194.8)}px`,
            top: `${getCenterY(81)}px`,
            transform: `translate(-50%, -50%) scaleX(${pillScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: `${14.3 * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#1D1F23',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {pillText}
        </div>

        {/* ── 16. COUNTDOWN NUMBER: 3, 2, 1, Go! (Centered at 194.8, 289.2) ── */}
        <div
          ref={(el) => { elemRefs.current['text-number'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(194.8)}px`,
            top: `${getCenterY(289.2)}px`,
            transform: `translate(-50%, -50%) scaleX(${numberScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${(step === 3 ? 120 : 214) * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#1D1F23',
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <div
            key={`num-${step}-${countdownStarted ? 'active' : 'idle'}`}
            className={(!countdownStarted || isPaused) ? '' : 'countdown-anim-number'}
            style={{
              lineHeight: 1,
              letterSpacing: 0,
              whiteSpace: 'nowrap',
              animation: (!countdownStarted || isPaused) ? 'none' : 'countdown-number-tick 0.8s forwards',
            }}
          >
            {stepNumberText}
          </div>
        </div>

        {/* ── 17. "Get ready!" (Centered at 194.8, 467.6) ── */}
        <div
          ref={(el) => { elemRefs.current['text-get-ready'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(194.8)}px`,
            top: `${getCenterY(467.6)}px`,
            transform: `translate(-50%, -50%) scaleX(${getReadyScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${46.5 * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#1D1F23',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {headlineText}
        </div>

        {/* ── 18. "First question coming up" / "Here we go!" (Centered at 194.8, 509.1) ── */}
        <div
          ref={(el) => { elemRefs.current['text-sub-ready'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(194.8)}px`,
            top: `${getCenterY(509.1)}px`,
            transform: `translate(-50%, -50%) scaleX(${subReadyScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: `${17.6 * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#767576',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {subtitleText}
        </div>

        {/* ── 19. "VS" TEXT (Centered at 195.2, 631.6) ── */}
        <div
          ref={(el) => { elemRefs.current['text-vs'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(195.2)}px`,
            top: `${getCenterY(631.6)}px`,
            transform: `translate(-50%, -50%) scaleX(${vsScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${26 * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#1D1F23',
            zIndex: 26,
            pointerEvents: 'none',
          }}
        >
          VS
        </div>

        {/* ── 20. PLAYER ME NAME: Center (102.8, 702.5) ── */}
        <div
          ref={(el) => { elemRefs.current['text-name-me'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(102.8)}px`,
            top: `${getCenterY(702.5)}px`,
            transform: `translate(-50%, -50%) scaleX(${meNameScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${19 * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#1D1F23',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {displayMeName}
        </div>

        {/* ── 21. PLAYER FRIEND NAME: Center (288.9, 702.5) ── */}
        <div
          ref={(el) => { elemRefs.current['text-name-friend'] = el; }}
          style={{
            position: 'absolute',
            left: `${getCenterX(288.9)}px`,
            top: `${getCenterY(702.5)}px`,
            transform: `translate(-50%, -50%) scaleX(${friendNameScaleX})`,
            transformOrigin: 'center center',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${19 * u}px`,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: '#1D1F23',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {displayFriendName}
        </div>
      </div>

      {/* ── DEV BAR (SHOWN ONLY WHEN URL HAS ?debug=1, PLACED SMALL AT TOP CENTER) ── */}
      {isDebugParam && (
        <div
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17181B]/95 text-white backdrop-blur shadow-xl border border-white/20 font-['Nunito',sans-serif] text-[11px] font-bold"
        >
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
              isPaused
                ? 'bg-[#FDE776] text-[#17181B] shadow-sm hover:bg-[#FDD835]'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isPaused ? 'Resume countdown' : 'Pause countdown'}
          >
            <span>{isPaused ? '▶ Play' : '⏸ Pause'}</span>
          </button>

          <div className="h-2.5 w-[1px] bg-white/20" />

          {/* Step buttons */}
          <div className="flex items-center gap-0.5">
            {(['3', '2', '1', 'Go!'] as const).map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setStep(idx);
                  setIsPaused(true);
                }}
                className={`min-w-5 h-5 px-1 rounded-full text-[10px] font-black transition-all flex items-center justify-center cursor-pointer ${
                  step === idx
                    ? 'bg-white text-[#17181B] shadow-sm scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/15'
                }`}
                title={`Preview step ${label}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-2.5 w-[1px] bg-white/20" />

          <button
            type="button"
            onClick={handleRestart}
            className="px-1.5 py-0.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-bold cursor-pointer"
            title="Restart countdown from 3"
          >
            Restart
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="px-1.5 py-0.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-bold cursor-pointer"
            title="Skip countdown"
          >
            Skip➔
          </button>

          <button
            type="button"
            onClick={() => {
              setDebugPanelOpen((prev) => !prev);
              setTimeout(runDiagnostics, 50);
            }}
            className="px-2 py-0.5 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 text-[10px] font-black cursor-pointer font-mono"
            title="Toggle Diagnostics Table"
          >
            {debugPanelOpen ? '✕ Table' : '⚙ Math'}
          </button>
        </div>
      )}

      {/* ── DEV INSPECTOR PANEL & CONTROLS (?debug=1 and Table Open) ── */}
      {isDebugParam && debugPanelOpen && (
        <div
          className="fixed inset-x-2 top-10 bottom-6 z-[998] bg-[#141517]/95 text-white rounded-xl shadow-2xl p-4 overflow-y-auto font-mono text-[11px] border border-white/10 select-text flex flex-col gap-3"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div>
              <span className="font-bold text-yellow-400 text-[13px]">Countdown Screen Diagnostics</span>
              <span className="ml-2 text-white/50">
                sx: {sx.toFixed(4)} | sy: {sy.toFixed(4)} | u: {u.toFixed(4)} | vw: {vw.toFixed(1)}px | vh: {vh.toFixed(1)}px
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                type="button"
                onClick={runDiagnostics}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-400 text-[10px]"
              >
                Re-measure
              </button>
              <button
                type="button"
                onClick={() => setDebugPanelOpen(false)}
                className="px-2 py-1 bg-white/20 text-white rounded hover:bg-white/30 text-[10px]"
              >
                Close Table
              </button>
            </div>
          </div>

          {/* Quick Modifier Buttons */}
          <div className="flex flex-wrap gap-2 text-[10.5px] items-center bg-white/5 p-2 rounded-lg">
            <span className="text-white/60">Toggle Dynamic Data:</span>

            {/* Names */}
            <button
              type="button"
              onClick={() => {
                setMe((prev) => ({
                  ...prev,
                  name: prev.name === 'Alex' ? 'Alexander Longname' : 'Alex',
                }));
                setFriend((prev) => ({
                  ...prev,
                  name: prev.name === 'Sam' ? 'Samantha The Great' : 'Sam',
                }));
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
            >
              Names: {me.name} & {friend.name}
            </button>

            {/* Avatars */}
            <button
              type="button"
              onClick={() => {
                setMe((prev) => ({
                  ...prev,
                  avatarId: (prev.avatarId % 6) + 1,
                  color: ['salmon', 'teal', 'indigo', 'slate', 'lime', 'orange'][prev.avatarId % 6],
                }));
                setFriend((prev) => ({
                  ...prev,
                  avatarId: ((prev.avatarId + 1) % 6) + 1,
                  color: ['teal', 'indigo', 'slate', 'lime', 'orange', 'salmon'][prev.avatarId % 6],
                }));
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
            >
              Avatars: {me.avatarId} vs {friend.avatarId}
            </button>

            {/* Mode */}
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'Trivia' ? 'Know Me' : m === 'Know Me' ? 'Mixed' : 'Trivia'));
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
            >
              Mode: {mode}
            </button>

            {/* Rounds */}
            <button
              type="button"
              onClick={() => {
                setRounds((r) => (r === 10 ? 5 : r === 5 ? 15 : 10));
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
            >
              Rounds: {rounds}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px]">
              <thead>
                <tr className="border-b border-white/20 text-white/50">
                  <th className="py-1 px-2">Element</th>
                  <th className="py-1 px-2">Expected Center (X, Y)</th>
                  <th className="py-1 px-2">Measured Center (X, Y)</th>
                  <th className="py-1 px-2">Expected (w, h)</th>
                  <th className="py-1 px-2">Measured (w, h)</th>
                  <th className="py-1 px-2">Diff (dCX, dCY, dw, dh)</th>
                  <th className="py-1 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((d) => (
                  <tr
                    key={d.key}
                    className={`border-b border-white/5 font-mono ${
                      d.pass ? 'text-green-300' : 'text-red-400 font-bold bg-red-950/40'
                    }`}
                  >
                    <td className="py-1 px-2 text-white">{d.name}</td>
                    <td className="py-1 px-2 text-white/70">
                      ({d.expectedCenterX.toFixed(1)}, {d.expectedCenterY.toFixed(1)})
                    </td>
                    <td className="py-1 px-2">
                      ({d.measuredCenterX.toFixed(1)}, {d.measuredCenterY.toFixed(1)})
                    </td>
                    <td className="py-1 px-2 text-white/70">
                      {d.expectedW.toFixed(1)} × {d.expectedH.toFixed(1)}
                    </td>
                    <td className="py-1 px-2">
                      {d.measuredW.toFixed(1)} × {d.measuredH.toFixed(1)}
                    </td>
                    <td className="py-1 px-2">
                      {d.diffCenterX.toFixed(1)}px, {d.diffCenterY.toFixed(1)}px, {d.diffW.toFixed(1)}px, {d.diffH.toFixed(1)}px
                    </td>
                    <td className="py-1 px-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                          d.pass ? 'bg-green-500/20 text-green-300' : 'bg-red-500/30 text-red-300'
                        }`}
                      >
                        {d.pass ? 'PASS (≤1px)' : 'FAIL (>1px)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-white/40 pt-1">
            New Responsive Rule: Horizontal: X = vw/2 + (cx - 195) * u | Vertical: Y = cy * sy | Size: w * u, h * u | u = min(vw/390, vh/844).
          </div>
        </div>
      )}
    </div>
  );
};
