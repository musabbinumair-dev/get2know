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
import { GameSessionProvider, useGameSession } from './services/gameSessionContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CreateProfileScreen } from './screens/CreateProfileScreen';
import { InviteFriendScreen } from './screens/InviteFriendScreen';
import { JoinCodeScreen } from './screens/JoinCodeScreen';
import { TodayQuestionScreen } from './screens/TodayQuestionScreen';
import { AnswerLockedScreen } from './screens/AnswerLockedScreen';
import { RevealScreen } from './screens/RevealScreen';
import { TriviaQuestionScreen } from './screens/TriviaQuestionScreen';
import { KnowMeGuessScreen } from './screens/KnowMeGuessScreen';
import { FinalResultScreen } from './screens/FinalResultScreen';
import { ScoresScreen } from './screens/ScoresScreen';
import { MemoryWallScreen } from './screens/MemoryWallScreen';
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
import { normalizeRoomCode, MemoryEntry } from './services/roomService';

// ── ENTRY GUARD COMPONENT ──
function EntryGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, profile, setPendingInviteCode, startGuestSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const pathname = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const searchParams = new URLSearchParams(location.search);
    const joinParam = searchParams.get('join') || searchParams.get('code');

    // Requirement 5: Opening ?join=CODE jumps straight to the join screen with the code filled in.
    if (joinParam) {
      setPendingInviteCode(joinParam);
      if (pathname !== '/join') {
        navigate('/join', { replace: true });
        return;
      }
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
  const gameSession = useGameSession();
  const {
    sessionType,
    user,
    profile,
    partnerProfile: sessionPartnerProfile,
    room,
    roomCode,
    history,
    memories,
    saveMemory,
    pendingInviteCode,
    startGuestSession,
    signInWithGoogle,
    saveProfile,
    createRoom,
    joinRoom,
    signOut,
    leaveDuo,
    welcomeBackToast,
    dismissWelcomeBackToast,
  } = useSession();

  // Real partner profile dynamically from room members
  const partnerProfile = sessionPartnerProfile;
  const inviteCode = roomCode || room?.code || '';

  // Settings & Duo state
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(true);
  const [dailyReminderTime, setDailyReminderTime] = useState<string>('9:00 PM');
  const [friendAlertsEnabled, setFriendAlertsEnabled] = useState<boolean>(true);
  const duoCreatedAt = room?.createdAt
    ? new Date(room.createdAt).toISOString().split('T')[0]
    : '';

  // Dynamic Questions Engine
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const activeQuestion = QUESTION_BANK[questionIndex % QUESTION_BANK.length];

  // Dynamic Answers
  const [player1Answer, setPlayer1Answer] = useState<string>(
    activeQuestion.player1DefaultAnswer
  );
  const player2Answer = activeQuestion.player2Answer;

  // Real Memory cards from shared room
  const memoryCards: MemoryCardProps[] = (memories || []).map((m) => ({
    id: m.id,
    category: m.category,
    color: m.color,
    cardBg: m.cardBg,
    date: m.date,
    question: m.question,
    p1Answer: m.p1Answer,
    p2Answer: m.p2Answer,
    p1Name: m.p1Name,
    p2Name: m.p2Name,
    p1AvatarId: m.p1AvatarId,
    p2AvatarId: m.p2AvatarId,
    p1Color: m.p1Color,
    p2Color: m.p2Color,
    isMatched: m.isMatched,
    reactions: m.reactions,
  }));

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
      try {
        const normalized = normalizeRoomCode(pendingInviteCode);
        await joinRoom(normalized, savedProfile);
        navigateWithLoader('/home');
      } catch (err) {
        navigateWithLoader('/join');
      }
    } else {
      try {
        await createRoom(savedProfile);
      } catch (err) {
        console.error('Error creating room:', err);
      }
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

  const handleSaveToMemoryWall = async () => {
    const newMemory: MemoryEntry = {
      id: `card-${Date.now()}`,
      category: activeQuestion.category,
      color: 'yellow',
      cardBg: isMatched ? '#E0ECB5' : '#F7E7CD',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      question: activeQuestion.question,
      isMatched: isMatched,
      p1Name: profile?.name || 'You',
      p1AvatarId: profile?.avatarId || 1,
      p1Color: profile?.color || 'salmon',
      p1Answer: player1Answer,
      p2Name: partnerProfile?.name || 'Your friend',
      p2AvatarId: partnerProfile?.avatarId || 2,
      p2Color: partnerProfile?.color || 'teal',
      p2Answer: player2Answer,
      reactions: selectedReaction
        ? [
            {
              emoji: selectedReaction,
              count: 1,
            },
          ]
        : undefined,
      createdAt: new Date().toISOString(),
    };

    await saveMemory(newMemory);
  };

  const currentProfile: UserProfile = profile || {
    avatarId: 1,
    name: user?.displayName || 'You',
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
              partnerProfile={partnerProfile || undefined}
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

        {/* Guess Screen (Know Me mode, or Trivia if round is trivia) */}
        <Route
          path="/guess"
          element={
            gameSession.isActive && gameSession.currentRoundType === 'trivia' ? (
              <TriviaQuestionScreen
                onBack={() => navigateWithLoader('/home')}
                onLockAnswer={() => navigateWithLoader('/locked')}
              />
            ) : (
              <KnowMeGuessScreen
                onBack={() => navigateWithLoader('/home')}
                onLockAnswer={() => navigateWithLoader('/reveal')}
              />
            )
          }
        />
        <Route
          path="/guess-know-me"
          element={
            <KnowMeGuessScreen
              onBack={() => navigateWithLoader('/home')}
              onLockAnswer={() => navigateWithLoader('/reveal')}
            />
          }
        />
        <Route
          path="/trivia-question"
          element={
            <TriviaQuestionScreen
              onBack={() => navigateWithLoader('/home')}
              onLockAnswer={() => navigateWithLoader('/locked')}
            />
          }
        />

        {/* Reveal */}
        <Route
          path="/reveal"
          element={
            <RevealScreen
              player1Name={currentProfile.name || 'You'}
              player1AvatarId={currentProfile.avatarId}
              player1Color={currentProfile.color}
              player2Name={partnerProfile?.name || 'Your friend'}
              player2AvatarId={partnerProfile?.avatarId || 2}
              player2Color={partnerProfile?.color || 'teal'}
              questionData={activeQuestion}
              player1Answer={player1Answer}
              player2Answer={player2Answer}
              syncScore={history.stats.syncScore || 0}
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
              friendName={partnerProfile?.name || 'Your friend'}
              friendAvatarId={partnerProfile?.avatarId || 2}
              friendBlobId={partnerProfile?.color || 'teal'}
              streak={history.stats.streak || 0}
              onEditAnswer={() => {
                const isTrivia =
                  (gameSession.isActive && gameSession.currentRoundType === 'trivia') ||
                  sessionStorage.getItem('gty_last_mode') === 'trivia' ||
                  localStorage.getItem('gty_last_mode') === 'trivia';
                if (isTrivia) {
                  navigateWithLoader('/trivia-question');
                } else {
                  navigateWithLoader('/today-question');
                }
              }}
              onOpenSettings={() => navigateWithLoader('/profile')}
              onOpenFriendProfile={() => navigateWithLoader('/friend')}
              onNavigateTab={handleTabNavigate}
              onPlayer2Answered={() => {
                const isTrivia =
                  (gameSession.isActive && gameSession.currentRoundType === 'trivia') ||
                  sessionStorage.getItem('gty_last_mode') === 'trivia' ||
                  localStorage.getItem('gty_last_mode') === 'trivia';
                if (isTrivia) {
                  navigateWithLoader('/reveal');
                } else {
                  navigateWithLoader('/guess');
                }
              }}
            />
          }
        />

        {/* Scores */}
        <Route
          path="/scores"
          element={
            <ScoresScreen
              player1Profile={currentProfile}
              player2Profile={partnerProfile || undefined}
              syncScore={history.stats.syncScore || 0}
              streak={history.stats.streak || 0}
              matches={history.stats.matches || 0}
              guessWins={history.stats.guessWins || 0}
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
              partnerProfile={partnerProfile || undefined}
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
              friendData={
                partnerProfile
                  ? {
                      name: partnerProfile.name,
                      subtitle: `${partnerProfile.color ? partnerProfile.color.charAt(0).toUpperCase() + partnerProfile.color.slice(1) : 'Duo'} player`,
                      avatarId: partnerProfile.avatarId || 2,
                      color: partnerProfile.color || 'teal',
                      streakDays: history.stats.streak || 0,
                      matchesCount: history.stats.matches || 0,
                      guessWinsCount: history.stats.guessWins || 0,
                      lastAnsweredTime: 'In your duo',
                    }
                  : {
                      name: 'Your friend',
                      subtitle: 'Waiting for them to join',
                      avatarId: 2,
                      color: 'teal',
                      streakDays: 0,
                      matchesCount: 0,
                      guessWinsCount: 0,
                      lastAnsweredTime: 'Not joined yet',
                    }
              }
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
