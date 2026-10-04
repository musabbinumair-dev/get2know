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
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CreateProfileScreen } from './screens/CreateProfileScreen';
import { InviteFriendScreen, generateInviteCode } from './screens/InviteFriendScreen';
import { JoinCodeScreen } from './screens/JoinCodeScreen';
import { AnswerLockedScreen } from './screens/AnswerLockedScreen';
import { RevealScreen } from './screens/RevealScreen';
import { GuessScreen } from './screens/GuessScreen';
import { ScoresScreen } from './screens/ScoresScreen';
import { MemoryWallScreen, INITIAL_CARDS } from './screens/MemoryWallScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FriendProfileScreen } from './screens/FriendProfileScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameSettingsScreen } from './screens/GameSettingsScreen';
import { MemoryCardProps } from './components/MemoryCard';
import { NavTab } from './components/BottomNav';
import { QUESTION_BANK } from './data/gameData';

// ── ENTRY GUARD COMPONENT ──
function EntryGuard({ children }: { children: React.ReactNode }) {
  const { sessionType, isLoading, profile, setPendingInviteCode } = useSession();
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
      if (sessionType === 'NEW' || !profile) {
        navigate('/welcome', { replace: true });
        return;
      }
    }

    // 1. Signed in with Google but NO profile in Firestore -> redirect to /create-profile
    if (sessionType === 'GOOGLE' && !profile) {
      if (pathname !== '/create-profile') {
        navigate('/create-profile', { replace: true });
      }
      return;
    }

    // 2. NEW session (no profile, not signed in) -> any route except /welcome and /join redirects to /welcome
    if (sessionType === 'NEW' || !profile) {
      if (pathname !== '/welcome' && pathname !== '/join') {
        navigate('/welcome', { replace: true });
      }
      return;
    }

    // 3. GUEST or GOOGLE session WITH a profile -> visiting /welcome or root / redirects to /home
    if (profile) {
      if (pathname === '/welcome' || pathname === '/') {
        navigate('/home', { replace: true });
      }
    }
  }, [isLoading, sessionType, profile, location.pathname, location.search, navigate, setPendingInviteCode]);

  return <>{children}</>;
}

// ── MAIN APP ROUTER COMPONENT ──
function AppContent() {
  const navigate = useNavigate();
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
    if (tab === 'today') {
      navigate('/home');
    } else if (tab === 'guess') {
      navigate('/guess');
    } else if (tab === 'scores') {
      navigate('/scores');
    } else if (tab === 'memory') {
      navigate('/memory');
    }
  };

  const handleGetStarted = () => {
    startGuestSession();
    navigate('/create-profile');
  };

  const handleContinueWithGoogle = async () => {
    const success = await signInWithGoogle();
    if (success) {
      // EntryGuard will automatically redirect to /home or /create-profile
    }
  };

  const handleContinueProfile = async (savedProfile: UserProfile) => {
    await saveProfile(savedProfile);
    if (pendingInviteCode) {
      navigate('/join');
    } else {
      navigate('/invite');
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = (questionIndex + 1) % QUESTION_BANK.length;
    setQuestionIndex(nextIdx);
    setPlayer1Answer(QUESTION_BANK[nextIdx].player1DefaultAnswer);
    setSelectedReaction(null);
    navigate('/home');
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
              emoji:
                selectedReaction === '1'
                  ? '✨'
                  : selectedReaction === '2'
                  ? '💀'
                  : selectedReaction === '3'
                  ? '😍'
                  : selectedReaction === '4'
                  ? '🔥'
                  : '👀',
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
      <Routes>
        {/* Welcome */}
        <Route
          path="/welcome"
          element={
            <WelcomeScreen
              onGetStarted={handleGetStarted}
              onContinueWithGoogle={handleContinueWithGoogle}
              onJoinCode={() => navigate('/join')}
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
              onBack={() => navigate('/welcome')}
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
              onBack={() => navigate('/create-profile')}
              onEnterGame={() => navigate('/home')}
            />
          }
        />

        {/* Join Code */}
        <Route
          path="/join"
          element={
            <JoinCodeScreen
              validCode={pendingInviteCode || inviteCode}
              onBack={() => navigate('/welcome')}
              onCreateDuo={handleGetStarted}
              onJoinSuccess={() => navigate('/home')}
            />
          }
        />
        <Route path="/join-code" element={<Navigate to="/join" replace />} />

        {/* Home & Today */}
        <Route
          path="/home"
          element={
            <HomeScreen
              onOpenSettings={() => navigate('/profile')}
              onOpenFriendProfile={() => navigate('/friend')}
              onNavigateTab={handleTabNavigate}
              onOpenGameSettings={() => navigate('/settings-game')}
            />
          }
        />
        <Route path="/today" element={<Navigate to="/home" replace />} />
        <Route path="/lobby" element={<Navigate to="/home" replace />} />

        {/* Game Settings */}
        <Route
          path="/settings-game"
          element={<GameSettingsScreen onBack={() => navigate('/home')} />}
        />
        <Route
          path="/game-settings"
          element={<Navigate to="/settings-game" replace />}
        />

        {/* Guess */}
        <Route
          path="/guess"
          element={
            <GuessScreen
              questionData={activeQuestion}
              realAnswer={player2Answer}
              streak={history.stats.streak}
              onBack={() => navigate('/home')}
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
                navigate('/reveal');
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
              onBack={() => navigate('/locked')}
              onNavigateTab={handleTabNavigate}
            />
          }
        />

        {/* Locked */}
        <Route
          path="/locked"
          element={
            <AnswerLockedScreen
              friendName={partnerProfile.name || 'Alex'}
              onEditAnswer={() => navigate('/home')}
              onOpenSettings={() => navigate('/profile')}
              onNavigateTab={handleTabNavigate}
              onPlayer2Answered={() => navigate('/guess')}
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
              onOpenSettings={() => navigate('/profile')}
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
              onBack={() => navigate('/home')}
              onEditProfile={() => navigate('/create-profile')}
              onSignOut={async () => {
                await signOut();
                navigate('/welcome', { replace: true });
              }}
              onLeaveDuo={async () => {
                await leaveDuo();
                navigate('/welcome', { replace: true });
              }}
              onToggleDailyReminder={setDailyReminderEnabled}
              onChangeReminderTime={setDailyReminderTime}
              onToggleFriendAlerts={setFriendAlertsEnabled}
              onOpenFriendProfile={() => navigate('/friend')}
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
              onBack={() => navigate('/profile')}
            />
          }
        />
        <Route path="/friend-profile" element={<Navigate to="/friend" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

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
      <SessionProvider>
        <EntryGuard>
          <AppContent />
        </EntryGuard>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
