import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../components/Screen';
import {
  MemoryCard,
  MemoryCardProps,
  getAvatarBlobSrc,
  getAvatarFaceSrc,
  resolveReactionInfo,
} from '../components/MemoryCard';
import { BottomNav, NavTab } from '../components/BottomNav';
import { UserProfile } from './CreateProfileScreen';

export interface MemoryWallScreenProps {
  onNavigateTab?: (tab: NavTab) => void;
  cards?: MemoryCardProps[];
  userProfile?: UserProfile;
}

export type FilterCategory = 'all' | 'funny' | 'deep' | 'matched';

export const INITIAL_CARDS: MemoryCardProps[] = [
  {
    id: 1,
    date: 'May 18',
    color: 'pink',
    question: 'Worst food you’ve tried?',
    p1Answer: 'Fried crickets',
    p2Answer: 'Anchovies',
    matched: true,
    reactions: 'laugh',
    category: 'funny',
  },
  {
    id: 2,
    date: 'May 16',
    color: 'blue',
    question: 'A fear you’d never tell anyone?',
    p1Answer: 'Deep water',
    p2Answer: 'Being forgotten',
    deco: 'moon',
    reactions: 'heart',
    category: 'deep',
  },
  {
    id: 3,
    date: 'May 14',
    color: 'yellow',
    question: 'Your dream city?',
    p1Answer: 'Tokyo',
    p2Answer: 'Lisbon',
    deco: 'star',
    reactions: 'smile',
    category: 'other',
  },
  {
    id: 4,
    date: 'May 12',
    color: 'pink',
    question: 'What’s your biggest guilty pleasure?',
    p1Answer: 'Anime marathons',
    p2Answer: 'Late night snacks',
    matched: true,
    reactions: 'smirk',
    category: 'funny',
  },
  {
    id: 5,
    date: 'May 10',
    color: 'blue',
    question: 'If you could have any superpower, what would it be?',
    p1Answer: 'Teleportation',
    p2Answer: 'Mind reading',
    deco: 'cross',
    reactions: 'surprised',
    category: 'funny',
  },
  {
    id: 6,
    date: 'May 08',
    color: 'yellow',
    question: 'What’s your ideal weekend?',
    p1Answer: 'Gaming + food',
    p2Answer: 'Nature + chill',
    deco: 'heart',
    reactions: 'heart',
    category: 'other',
  },
  {
    id: 7,
    date: 'May 06',
    color: 'pink',
    question: 'Which fictional character are you most like?',
    p1Answer: 'Luffy',
    p2Answer: 'Gojo',
    deco: 'star',
    decoOffset: { top: 13, w: 31 },
    reactions: 'laugh',
    category: 'funny',
  },
  {
    id: 8,
    date: 'May 04',
    color: 'olive',
    question: 'What’s something you think about more than you should?',
    p1Answer: 'The future',
    p2Answer: 'Past mistakes',
    deco: 'moon',
    reactions: 'cry',
    category: 'deep',
  },
];

export const MemoryWallScreen: React.FC<MemoryWallScreenProps> = ({
  onNavigateTab,
  cards: propCards = INITIAL_CARDS,
  userProfile,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [selectedCard, setSelectedCard] = useState<MemoryCardProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Read saved cards from persistent storage, merging with initial cards
  const [localCards, setLocalCards] = useState<MemoryCardProps[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_memory_cards');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {}
      }
    }
    return propCards;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_memory_cards');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalCards(parsed);
          }
        } catch {}
      }
    }
  }, [propCards]);

  const cards = localCards;

  // Active user profile (from prop or localStorage)
  const [activeProfile, setActiveProfile] = useState<UserProfile>(() => {
    if (userProfile) return userProfile;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      avatarId: 1,
      name: 'Player',
      color: 'salmon',
    };
  });

  useEffect(() => {
    if (userProfile) {
      setActiveProfile(userProfile);
    }
  }, [userProfile]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Background #9BAE6F across html, body
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#9BAE6F';
    document.documentElement.style.backgroundColor = '#9BAE6F';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Reset scroll on filter change
  const handleFilterChange = (filter: FilterCategory) => {
    setActiveFilter(filter);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter cards
  const filteredCards = cards.filter((card) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ =
        card.question.toLowerCase().includes(q) ||
        card.p1Answer.toLowerCase().includes(q) ||
        card.p2Answer.toLowerCase().includes(q) ||
        card.date.toLowerCase().includes(q);
      if (!matchQ) return false;
    }

    if (activeFilter === 'all') return true;
    if (activeFilter === 'matched') return !!card.matched;
    if (activeFilter === 'funny') return card.category === 'funny';
    if (activeFilter === 'deep') return card.category === 'deep';
    return true;
  });

  // Masonry distribution: alternate left and right columns
  const leftColumnCards = filteredCards.filter((_, idx) => idx % 2 === 0);
  const rightColumnCards = filteredCards.filter((_, idx) => idx % 2 === 1);

  return (
    <Screen bg="#9BAE6F" className="h-full min-h-[100dvh]">
      {/* ---------------- PINNED HEADER LAYER (DOES NOT SCROLL) ---------------- */}
      <div className="relative w-full z-20 flex-shrink-0 bg-[#9BAE6F] pt-7 sm:pt-9 px-6 sm:px-7 select-none">
        {/* Top Bar: Title "Memory wall" & Search Button */}
        <div className="relative w-full max-w-[390px] mx-auto h-[44px] flex items-center justify-between select-none z-20 flex-shrink-0">
          <h1 className="text-[28px] sm:text-[32px] font-black text-[#17181B] leading-none tracking-[-0.025em]">
            Memory wall
          </h1>

          {/* Search Button (matches circular button style on other pages) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Search memories"
            className="btn-press w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full border-[1.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#17181B"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* Quick Search Input if open */}
        {isSearchOpen && (
          <div className="mt-2.5 animate-pop">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or answers..."
              className="w-full h-[36px] px-3.5 rounded-full bg-[#F8F1E3] text-[13px] font-bold text-[#17181B] placeholder:text-[#17181B]/40 outline-none border border-[#17181B]/15 shadow-sm"
              autoFocus
            />
          </div>
        )}

        {/* Filter Chips at y 76 */}
        <div className="flex items-center gap-2 mt-3 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {/* All */}
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-4 h-[29px] rounded-full text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              activeFilter === 'all'
                ? 'bg-[#17181B] text-white shadow-sm'
                : 'bg-[#F8F1E3] text-[#17181B] hover:bg-[#F8F1E3]/80'
            }`}
          >
            All
          </button>

          {/* Funny */}
          <button
            type="button"
            onClick={() => handleFilterChange('funny')}
            className={`px-4 h-[29px] rounded-full text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              activeFilter === 'funny'
                ? 'bg-[#17181B] text-white shadow-sm'
                : 'bg-[#F8F1E3] text-[#17181B] hover:bg-[#F8F1E3]/80'
            }`}
          >
            Funny
          </button>

          {/* Deep */}
          <button
            type="button"
            onClick={() => handleFilterChange('deep')}
            className={`px-4 h-[29px] rounded-full text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              activeFilter === 'deep'
                ? 'bg-[#17181B] text-white shadow-sm'
                : 'bg-[#F8F1E3] text-[#17181B] hover:bg-[#F8F1E3]/80'
            }`}
          >
            Deep
          </button>

          {/* Matched */}
          <button
            type="button"
            onClick={() => handleFilterChange('matched')}
            className={`px-4 h-[29px] rounded-full text-[13px] font-extrabold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              activeFilter === 'matched'
                ? 'bg-[#17181B] text-white shadow-sm'
                : 'bg-[#F8F1E3] text-[#17181B] hover:bg-[#F8F1E3]/80'
            }`}
          >
            Matched
          </button>
        </div>
      </div>

      {/* ---------------- SCROLL REGION (CARDS SLIDE UNDER TOP HEADER & BOTTOM NAV) ---------------- */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-5 pt-1 pb-[100px] overscroll-contain select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
      >
        {/* Top subtle 16px fade */}
        <div
          className="sticky top-0 left-0 right-0 h-[16px] pointer-events-none z-10 -mx-4 mb-1"
          style={{
            background: 'linear-gradient(to bottom, #9BAE6F 20%, rgba(155, 174, 111, 0) 100%)',
          }}
        />

        {/* Empty State */}
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <span className="text-[15px] font-bold text-[#17181B]/55">
              No memories here yet
            </span>
          </div>
        ) : (
          /* 2 MASONRY FLEX COLUMNS: 10px column gap, 11px vertical gap */
          <div className="grid grid-cols-2 gap-[10px] w-full items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-[11px] w-full">
              {leftColumnCards.map((card) => (
                <MemoryCard
                  key={card.id}
                  {...card}
                  p1AvatarId={card.p1AvatarId ?? activeProfile.avatarId}
                  p1Color={card.p1Color ?? activeProfile.color}
                  p1Name={card.p1Name ?? (activeProfile.name || 'Player 1')}
                  p2AvatarId={card.p2AvatarId ?? (activeProfile.avatarId === 2 ? 1 : 2)}
                  p2Color={card.p2Color ?? (activeProfile.color === 'salmon' ? 'teal' : 'salmon')}
                  p2Name={card.p2Name ?? 'Player 2'}
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-[11px] w-full">
              {rightColumnCards.map((card) => (
                <MemoryCard
                  key={card.id}
                  {...card}
                  p1AvatarId={card.p1AvatarId ?? activeProfile.avatarId}
                  p1Color={card.p1Color ?? activeProfile.color}
                  p1Name={card.p1Name ?? (activeProfile.name || 'Player 1')}
                  p2AvatarId={card.p2AvatarId ?? (activeProfile.avatarId === 2 ? 1 : 2)}
                  p2Color={card.p2Color ?? (activeProfile.color === 'salmon' ? 'teal' : 'salmon')}
                  p2Name={card.p2Name ?? 'Player 2'}
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- BOTTOM NAVIGATION DOCK (EXACT SAME AS OTHER PAGES) ---------------- */}
      <div className="absolute bottom-0 left-0 right-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-30 pointer-events-auto">
        <BottomNav activeTab="memory" onTabChange={onNavigateTab} className="mb-0" />
      </div>

      {/* ---------------- MEMORY DETAIL MODAL / ROUTE STUB ---------------- */}
      {selectedCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#17181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-pop select-none"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full max-w-[340px] rounded-[28px] p-6 shadow-2xl relative"
            style={{
              backgroundColor:
                selectedCard.color === 'pink'
                  ? '#FBBCDE'
                  : selectedCard.color === 'blue'
                  ? '#9DBDFD'
                  : selectedCard.color === 'yellow'
                  ? '#FEDF6B'
                  : '#B5C68B',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-[32px] h-[32px] rounded-full bg-[#17181B]/10 hover:bg-[#17181B]/20 flex items-center justify-center text-[#17181B] font-bold text-[18px] cursor-pointer"
            >
              ×
            </button>

            {/* Date & Tag & Instagram Reaction Pill */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#17181B]/60">
                  {selectedCard.date}
                </span>
                {selectedCard.matched && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FEDF6B] text-[10px] font-extrabold text-[#17181B] shadow-xs">
                    ✨ Matched
                  </span>
                )}
              </div>

              {/* Instagram-style Reaction Pill */}
              {(() => {
                const modalReactionInfo = resolveReactionInfo(selectedCard.reactions);
                if (!modalReactionInfo) return null;
                return (
                  <div className="flex items-center gap-1 bg-white/90 rounded-full px-2.5 py-1 shadow-xs border border-[#17181B]/10 animate-pop">
                    {modalReactionInfo.imgSrc ? (
                      <img
                        src={modalReactionInfo.imgSrc}
                        alt=""
                        className="w-[18px] h-[18px] object-contain -rotate-[8deg]"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-[14px] leading-none -rotate-[8deg]">
                        {modalReactionInfo.char}
                      </span>
                    )}
                    <span className="text-[11px] font-extrabold text-[#17181B]">
                      {modalReactionInfo.count}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Question */}
            <h2 className="text-[22px] font-black text-[#17181B] leading-tight mb-5">
              {selectedCard.question}
            </h2>

            {/* Answer 1 (Dynamic Player 1 avatar and color blob) */}
            <div className="bg-white/40 rounded-[18px] p-3 mb-2.5 flex items-center gap-3">
              <div className="relative w-[42px] h-[42px] flex items-center justify-center flex-shrink-0 select-none">
                <img
                  src={getAvatarBlobSrc(
                    selectedCard.p1AvatarId ?? activeProfile.avatarId,
                    selectedCard.p1Color ?? activeProfile.color
                  )}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <img
                  src={getAvatarFaceSrc(selectedCard.p1AvatarId ?? activeProfile.avatarId)}
                  alt={selectedCard.p1Name ?? (activeProfile.name || 'Player 1')}
                  className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#17181B]/55 block">
                  {selectedCard.p1Name ?? (activeProfile.name || 'Player 1')}
                </span>
                <span className="text-[15px] font-black text-[#17181B] block">
                  {selectedCard.p1Answer}
                </span>
              </div>
            </div>

            {/* Answer 2 (Dynamic Player 2 avatar and color blob) */}
            <div className="bg-white/40 rounded-[18px] p-3 mb-4 flex items-center gap-3">
              <div className="relative w-[42px] h-[42px] flex items-center justify-center flex-shrink-0 select-none">
                <img
                  src={getAvatarBlobSrc(
                    selectedCard.p2AvatarId ?? (activeProfile.avatarId === 2 ? 1 : 2),
                    selectedCard.p2Color ?? (activeProfile.color === 'salmon' ? 'teal' : 'salmon')
                  )}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <img
                  src={getAvatarFaceSrc(selectedCard.p2AvatarId ?? (activeProfile.avatarId === 2 ? 1 : 2))}
                  alt={selectedCard.p2Name ?? 'Player 2'}
                  className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#17181B]/55 block">
                  {selectedCard.p2Name ?? 'Player 2'}
                </span>
                <span className="text-[15px] font-black text-[#17181B] block">
                  {selectedCard.p2Answer}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="btn-press w-full h-[46px] rounded-full bg-[#17181B] text-white font-bold text-[16px] flex items-center justify-center cursor-pointer shadow-md"
            >
              Close Memory
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
};
