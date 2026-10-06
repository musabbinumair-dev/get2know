import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { SessionProvider, useSession, UserProfile } from './services/sessionContext';
import { GameSessionProvider } from './services/gameSessionContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CreateProfileScreen } from './screens/CreateProfileScreen';
import { InviteFriendScreen, generateInviteCode } from './screens/InviteFriendScreen';
import { JoinCodeScreen } from './screens/JoinCodeScreen';
import { TodayQuestionScreen } from './screens/TodayQuestionScreen';
import { AnswerLockedScreen } from './screens/AnswerLockedScreen';
import { RevealScreen } from './screens/RevealScreen';
import { GuessScreen } from './screens/GuessScreen';
import { FinalResultScreen } from './screens/FinalResultScreen';
import { ScoresScreen } from './screens/ScoresScreen';
import { MemoryWallScreen, INITIAL_CARDS } from './screens/MemoryWallScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FriendProfileScreen } from './screens/FriendProfileScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameSettingsScreen } from './screens/GameSettingsScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { CountdownScreen } from './screens/CountdownScreen';
import { MemoryCardProps } from './components/MemoryCard';
import { NavTab } from './components/BottomNav';
import { QUESTION_BANK } from './data/gameData';
import { AppLoader } from './components/AppLoader';
import { PageGate } from './components/PageGate';
import { DebugPreloadOverlay } from './components/DebugPreloadOverlay';
import { LoaderProvider, useAppLoader } from './services/loaderContext';

// ── ENTRY GUARD COMPONENT ──
function EntryGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, profile, setPendingInviteCode, startGuestSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const pathname = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const searchParams = new URLSearchParams(location.search);
    const codeParam = searchParams.get('code');

    // Capture invite deep link code: /join?code=XXXXXX
    if (pathname === '/join' && codeParam) {
      setPendingInviteCode(codeParam);
    }

    // Save last pathname so refresh on game pages preserves location
    if (pathname !== '/welcome' && pathname !== '/') {
      localStorage.setItem('gty_last_pathname', pathname);
    }

    const gameRoutes = [
      '/home',
      '/guess',
      '/scores',
      '/memory',
      '/profile',
      '/friend-profile',
      '/lobby',
      '/settings-game',
      '/countdown',
      '/today-question',
      '/game-final',
      '/reveal',
      '/locked',
    ];

    // If user has a profile, visiting /welcome or root / restores last game route if any, else /home
    if (profile && (pathname === '/welcome' || pathname === '/')) {
      const lastPath = localStorage.getItem('gty_last_pathname');
      if (lastPath && gameRoutes.includes(lastPath) && lastPath !== '/home') {
        navigate(lastPath, { replace: true });
        return;
      }
      navigate('/home', { replace: true });
      return;
    }

    // Never redirect away from game pages on refresh
    if (!profile && gameRoutes.includes(pathname)) {
      startGuestSession();
      return;
    }
  }, [isLoading, profile, location.pathname, location.search, navigate, setPendingInviteCode, startGuestSession]);

  if (isLoading) {
    return <AppLoader theme="cream" message="Getting things ready…" />;
  }

  return <>{children}</>;
}

// ── MAIN APP ROUTER COMPONENT ──
function AppContent() {
  const { navigateWithLoader } = useAppLoader();
  const {
    sessionType,
    user,
    profile,
    history,
    pendingInviteCode,
    startGuestSession,
    signInWithGoogle,
    saveProfile,
    updateHistory,
    signOut,
    leaveDuo,
    welcomeBackToast,
    dismissWelcomeBackToast,
    guestHistoryToast,
    triggerFirstGameFinished,
    dismissGuestHistoryToast,
  } = useSession();

  // Partner Profile state
  const [partnerProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partner_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      avatarId: 2,
      name: 'Alex',
      color: 'teal',
    };
  });

  const [inviteCode] = useState<string>(() => generateInviteCode());

  // Settings & Duo state
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(true);
  const [dailyReminderTime, setDailyReminderTime] = useState<string>('9:00 PM');
  const [friendAlertsEnabled, setFriendAlertsEnabled] = useState<boolean>(true);
  const [duoCreatedAt] = useState<string>('2024-09-14');

  // Dynamic Questions Engine
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const activeQuestion = QUESTION_BANK[questionIndex % QUESTION_BANK.length];

  // Dynamic Answers
  const [player1Answer, setPlayer1Answer] = useState<string>(
    activeQuestion.player1DefaultAnswer
  );
  const player2Answer = activeQuestion.player2Answer;

  // Memory cards
  const [memoryCards, setMemoryCards] = useState<MemoryCardProps[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_memory_cards');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_CARDS;
  });

  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const isMatched =
    player1Answer.trim().toLowerCase() === player2Answer.trim().toLowerCase();

  const handleTabNavigate = (tab: NavTab) => {
    if (tab === 'home' || tab === 'today') {
      navigateWithLoader('/home');
    } else if (tab === 'scores') {
      navigateWithLoader('/scores');
    } else if (tab === 'memory') {
      navigateWithLoader('/memory');
    } else if (tab === 'profile') {
      navigateWithLoader('/profile');
    } else if (tab === 'guess') {
      navigateWithLoader('/guess');
    }
  };

  const handleGetStarted = () => {
    startGuestSession();
    navigateWithLoader('/create-profile');
  };

  const handleContinueWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleContinueProfile = async (savedProfile: UserProfile) => {
    await saveProfile(savedProfile);
    if (pendingInviteCode) {
      navigateWithLoader('/join');
    } else {
      navigateWithLoader('/invite');
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = (questionIndex + 1) % QUESTION_BANK.length;
    setQuestionIndex(nextIdx);
    setPlayer1Answer(QUESTION_BANK[nextIdx].player1DefaultAnswer);
    setSelectedReaction(null);
    navigateWithLoader('/home');
  };

  const handleSaveToMemoryWall = () => {
    const newCard: MemoryCardProps = {
      id: `card-${Date.now()}`,
      category: activeQuestion.category,
      cardBg: isMatched ? '#E0ECB5' : '#F7E7CD',
      date: 'TODAY',
      question: activeQuestion.question,
      isMatched: isMatched,
      p1Name: profile?.name || 'You',
      p1AvatarId: profile?.avatarId || 1,
      p1Color: (profile?.color as any) || 'salmon',
      p1Answer: player1Answer,
      p2Name: partnerProfile.name || 'Alex',
      p2AvatarId: partnerProfile.avatarId,
      p2Color: partnerProfile.color,
      p2Answer: player2Answer,
      reactions: selectedReaction
        ? [
            {
              emoji: selectedReaction,
              count: 1,
            },
          ]
        : undefined,
    };

    setMemoryCards((prev) => {
      const updated = [newCard, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('game_memory_cards', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const currentProfile: UserProfile = profile || {
    avatarId: 1,
    name: user?.displayName || 'Player 1',
    color: 'salmon',
  };

  return (
    <>
      <PageGate>
        <Routes>
          {/* Welcome */}
        <Route
          path="/welcome"
          element={
            <WelcomeScreen
              onGetStarted={handleGetStarted}
              onContinueWithGoogle={handleContinueWithGoogle}
              onJoinCode={() => navigateWithLoader('/join')}
            />
          }
        />

        {/* Create Profile */}
        <Route
          path="/create-profile"
          element={
            <CreateProfileScreen
              initialProfile={
                user && !profile
                  ? {
                      avatarId: 1,
                      name: user.displayName || '',
                      color: 'salmon',
                    }
                  : profile || undefined
              }
              onBack={async () => {
                await signOut();
                navigateWithLoader('/welcome');
              }}
              onContinue={handleContinueProfile}
            />
          }
        />

        {/* Invite Friend */}
        <Route
          path="/invite"
          element={
            <InviteFriendScreen
              userProfile={currentProfile}
              inviteCode={inviteCode}
              onBack={() => navigateWithLoader('/create-profile')}
              onEnterGame={() => navigateWithLoader('/home')}
            />
          }
        />

        {/* Join Code */}
        <Route
          path="/join"
          element={
            <JoinCodeScreen
              validCode={pendingInviteCode || inviteCode}
              onBack={() => navigateWithLoader('/welcome')}
              onCreateDuo={handleGetStarted}
              onJoinSuccess={() => navigateWithLoader('/home')}
            />
          }
        />
        <Route path="/join-code" element={<Navigate to="/join" replace />} />

        {/* Home & Today */}
        <Route
          path="/home"
          element={
            <HomeScreen
              onOpenSettings={() => navigateWithLoader('/profile')}
              onOpenFriendProfile={() => navigateWithLoader('/friend')}
              onNavigateTab={handleTabNavigate}
              onOpenGameSettings={() => navigateWithLoader('/settings-game')}
              onStartKnowMe={() => navigateWithLoader('/today-question')}
              onStartTrivia={() => navigateWithLoader('/lobby')}
            />
          }
        />
        <Route path="/today" element={<Navigate to="/home" replace />} />
        
        {/* Lobby */}
        <Route
          path="/lobby"
          element={
            <LobbyScreen
              onBack={() => navigateWithLoader('/settings-game')}
              onLeave={() => navigateWithLoader('/home')}
              onStartGame={() => navigateWithLoader('/countdown')}
            />
          }
        />

        {/* Countdown */}
        <Route
          path="/countdown"
          element={
            <CountdownScreen />
          }
        />

        {/* Game Settings */}
        <Route
          path="/settings-game"
          element={
            <GameSettingsScreen
              onBack={() => navigateWithLoader('/home')}
              onCreateGame={() => navigateWithLoader('/lobby')}
            />
          }
        />
        <Route
          path="/game-settings"
          element={<Navigate to="/settings-game" replace />}
        />

        {/* Today's Question (Know Me Round) */}
        <Route
          path="/today-question"
          element={
            <TodayQuestionScreen
              userProfile={currentProfile}
              partnerProfile={partnerProfile}
              onOpenSettings={() => navigateWithLoader('/profile')}
              onNavigateTab={handleTabNavigate}
              onLockInSuccess={() => navigateWithLoader('/locked')}
            />
          }
        />

        {/* Final Results Screen */}
        <Route
          path="/game-final"
          element={<FinalResultScreen />}
        />

        {/* Guess */}
        <Route
          path="/guess"
          element={
            <GuessScreen
              questionData={activeQuestion}
              realAnswer={player2Answer}
              streak={history.stats.streak}
              onBack={() => navigateWithLoader('/home')}
              onLockGuess={(_guess, isCorrect) => {
                updateHistory((prev) => ({
                  ...prev,
                  stats: {
                    ...prev.stats,
                    syncScore: isCorrect ? Math.min(100, prev.stats.syncScore + 15) : prev.stats.syncScore,
                    guessWins: isCorrect ? prev.stats.guessWins + 1 : prev.stats.guessWins,
                    streak: isCorrect ? prev.stats.streak + 1 : prev.stats.streak,
                    matches: isMatched ? prev.stats.matches + 1 : prev.stats.matches,
                  },
                }));
                triggerFirstGameFinished();
                navigateWithLoader('/reveal');
              }}
              onNavigateTab={handleTabNavigate}
            />
          }
        />

        {/* Reveal */}
        <Route
          path="/reveal"
          element={
            <RevealScreen
              player1Name={currentProfile.name || 'Player 1'}
              player1AvatarId={currentProfile.avatarId}
              player1Color={currentProfile.color}
              player2Name={partnerProfile.name || 'Alex'}
              player2AvatarId={partnerProfile.avatarId}
              player2Color={partnerProfile.color}
              questionData={activeQuestion}
              player1Answer={player1Answer}
              player2Answer={player2Answer}
              syncScore={history.stats.syncScore}
              isMatched={isMatched}
              selectedReaction={selectedReaction}
              onSelectReaction={(reactionId) => setSelectedReaction(reactionId)}
              onSaveToMemoryWall={handleSaveToMemoryWall}
              onNextQuestion={handleNextQuestion}
              onBack={() => navigateWithLoader('/locked')}
              onOpenSettings={() => navigateWithLoader('/profile')}
              onOpenFriendProfile={() => navigateWithLoader('/friend')}
              onNavigateTab={handleTabNavigate}
            />
          }
        />

        {/* Locked */}
        <Route
          path="/locked"
          element={
            <AnswerLockedScreen
              friendName={partnerProfile.name || 'Sam'}
              friendAvatarId={partnerProfile.avatarId || 2}
              friendBlobId={partnerProfile.color || 'teal'}
              streak={history.stats.streak || 12}
              onEditAnswer={() => navigateWithLoader('/home')}
              onOpenSettings={() => navigateWithLoader('/profile')}
              onOpenFriendProfile={() => navigateWithLoader('/friend')}
              onNavigateTab={handleTabNavigate}
              onPlayer2Answered={() => navigateWithLoader('/guess')}
            />
          }
        />

        {/* Scores */}
        <Route
          path="/scores"
          element={
            <ScoresScreen
              player1Profile={currentProfile}
              player2Profile={partnerProfile}
              syncScore={history.stats.syncScore}
              streak={history.stats.streak}
              matches={history.stats.matches}
              guessWins={history.stats.guessWins}
              onOpenSettings={() => navigateWithLoader('/profile')}
              onNavigateTab={handleTabNavigate}
            />
          }
        />

        {/* Memory Wall */}
        <Route
          path="/memory"
          element={
            <MemoryWallScreen
              cards={memoryCards}
              userProfile={currentProfile}
              onNavigateTab={handleTabNavigate}
            />
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProfileScreen
              userProfile={currentProfile}
              partnerProfile={partnerProfile}
              duoCreatedAt={duoCreatedAt}
              inviteCode={inviteCode}
              dailyReminderEnabled={dailyReminderEnabled}
              dailyReminderTime={dailyReminderTime}
              friendAlertsEnabled={friendAlertsEnabled}
              sessionType={sessionType}
              userEmail={user?.email || null}
              onSignInWithGoogle={signInWithGoogle}
              onBack={() => navigateWithLoader('/home')}
              onEditProfile={() => navigateWithLoader('/create-profile')}
              onSignOut={async () => {
                await signOut();
                navigateWithLoader('/welcome');
              }}
              onLeaveDuo={async () => {
                await leaveDuo();
                navigateWithLoader('/welcome');
              }}
              onToggleDailyReminder={setDailyReminderEnabled}
              onChangeReminderTime={setDailyReminderTime}
              onToggleFriendAlerts={setFriendAlertsEnabled}
              onOpenFriendProfile={() => navigateWithLoader('/friend')}
              onNavigateTab={handleTabNavigate}
            />
          }
        />

        {/* Friend Profile */}
        <Route
          path="/friend"
          element={
            <FriendProfileScreen
              friendData={{
                name: partnerProfile.name || 'Sam',
                subtitle: 'Teal player, joined Sep 12',
                streakDays: history.stats.streak,
                matchesCount: history.stats.matches,
                guessWinsCount: history.stats.guessWins,
                lastAnsweredTime: 'today, 8:42 PM',
              }}
              onBack={() => navigateWithLoader('/profile')}
              onNavigateTab={handleTabNavigate}
            />
          }
        />
        <Route path="/friend-profile" element={<Navigate to="/friend" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      </PageGate>

      {/* Interactive ?debug=1 Overlay */}
      <DebugPreloadOverlay />

      {/* Welcome Back Toast */}
      {welcomeBackToast && (
        <div
          onClick={dismissWelcomeBackToast}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#FCF7EB] border border-[#161B1E]/20 text-[#161B1E] font-extrabold text-[13.5px] px-5 py-2.5 rounded-full shadow-lg z-[9999] flex items-center gap-2 cursor-pointer animate-fadeIn font-['Nunito',sans-serif]"
        >
          <span>{welcomeBackToast}</span>
          <button
            type="button"
            className="text-[#161B1E]/50 hover:text-[#161B1E] ml-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* One-time cream toast after first finished game in GUEST session */}
      {guestHistoryToast && (
        <div
          onClick={async () => {
            dismissGuestHistoryToast();
            await signInWithGoogle();
          }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#FCF7EB] border-[1.5px] border-[#161B1E] text-[#161B1E] font-extrabold text-[13.5px] px-5 py-2.5 rounded-full shadow-xl z-[9999] flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all font-['Nunito',sans-serif]"
        >
          <svg width="15" height="15" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.547 0 9s.347 2.827.957 4.039l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
            />
          </svg>
          <span>Sign in to keep your history</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissGuestHistoryToast();
            }}
            className="text-[#161B1E]/50 hover:text-[#161B1E] ml-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <LoaderProvider>
        <SessionProvider>
          <GameSessionProvider>
            <EntryGuard>
              <AppContent />
            </EntryGuard>
          </GameSessionProvider>
        </SessionProvider>
      </LoaderProvider>
    </BrowserRouter>
  );
}

export default App;
