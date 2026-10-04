import { useState, useEffect } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CreateProfileScreen, UserProfile } from './screens/CreateProfileScreen';
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

type ScreenType =
  | 'home'
  | 'welcome'
  | 'create-profile'
  | 'invite'
  | 'join-code'
  | 'today'
  | 'locked'
  | 'guess'
  | 'scores'
  | 'memory'
  | 'reveal'
  | 'profile'
  | 'friend-profile'
  | 'sign-out'
  | 'time-picker'
  | 'leave-duo'
  | 'game-settings';

const VALID_SCREENS: ScreenType[] = [
  'home',
  'welcome',
  'create-profile',
  'invite',
  'join-code',
  'today',
  'locked',
  'guess',
  'scores',
  'memory',
  'reveal',
  'profile',
  'friend-profile',
  'sign-out',
  'time-picker',
  'leave-duo',
  'game-settings',
];

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('screen') as ScreenType | null;
      if (param && VALID_SCREENS.includes(param)) {
        return param;
      }
      const saved = localStorage.getItem('current_screen') as ScreenType | null;
      if (saved && VALID_SCREENS.includes(saved)) {
        return saved;
      }
    }
    return 'home';
  });

  // Sync current screen to URL search param and localStorage so reload never resets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_screen', currentScreen);
      const url = new URL(window.location.href);
      if (url.searchParams.get('screen') !== currentScreen) {
        url.searchParams.set('screen', currentScreen);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [currentScreen]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const param = new URLSearchParams(window.location.search).get('screen') as ScreenType | null;
      if (param && VALID_SCREENS.includes(param)) {
        setCurrentScreen(param);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Dynamic User Profile (Player 1)
  const [profile, setProfile] = useState<UserProfile>(() => {
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
      name: 'Player 1',
      color: 'salmon',
    };
  });

  // 2. Dynamic Duo Partner Profile (Player 2)
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
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daily_reminder_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [dailyReminderTime, setDailyReminderTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daily_reminder_time') || '9:00 PM';
    }
    return '9:00 PM';
  });

  const [friendAlertsEnabled, setFriendAlertsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('friend_alerts_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [duoCreatedAt] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('duo_created_at') || '2024-09-14';
    }
    return '2024-09-14';
  });

  const handleToggleDailyReminder = (enabled: boolean) => {
    setDailyReminderEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_reminder_enabled', enabled.toString());
    }
  };

  const handleChangeReminderTime = (time: string) => {
    setDailyReminderTime(time);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_reminder_time', time);
    }
  };

  const handleToggleFriendAlerts = (enabled: boolean) => {
    setFriendAlertsEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('friend_alerts_enabled', enabled.toString());
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('current_screen');
    }
    setCurrentScreen('welcome');
  };

  const handleLeaveDuo = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('partner_profile');
      localStorage.removeItem('current_screen');
      localStorage.removeItem('game_sync_score');
      localStorage.removeItem('game_streak');
      localStorage.removeItem('game_matches');
    }
    setCurrentScreen('welcome');
  };

  // 3. Dynamic Questions Engine
  const [questionIndex, setQuestionIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('active_question_index');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 0;
  });

  const activeQuestion = QUESTION_BANK[questionIndex % QUESTION_BANK.length];

  // 4. Dynamic Answers
  const [player1Answer, setPlayer1Answer] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`today_answer_${activeQuestion.id}`) || activeQuestion.player1DefaultAnswer;
    }
    return activeQuestion.player1DefaultAnswer;
  });

  const player2Answer = activeQuestion.player2Answer;

  // 5. Dynamic Scores & Stats
  const [syncScore, setSyncScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_sync_score');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 74;
  });

  const [streak, setStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_streak');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 12;
  });

  const [matches, setMatches] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_matches');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 38;
  });

  const [guessWins, setGuessWins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_guess_wins');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 21;
  });

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

  const [selectedReaction, setSelectedReaction] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_selected_reaction');
    }
    return null;
  });

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_sync_score', syncScore.toString());
      localStorage.setItem('game_streak', streak.toString());
      localStorage.setItem('game_matches', matches.toString());
      localStorage.setItem('game_guess_wins', guessWins.toString());
      localStorage.setItem('active_question_index', questionIndex.toString());
      localStorage.setItem('game_memory_cards', JSON.stringify(memoryCards));
    }
  }, [syncScore, streak, matches, guessWins, questionIndex, memoryCards]);

  const isMatched =
    player1Answer.trim().toLowerCase() === player2Answer.trim().toLowerCase();

  const handleGetStarted = () => {
    setCurrentScreen('create-profile');
  };

  const handleOpenJoinCode = () => {
    setCurrentScreen('join-code');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleContinueProfile = (savedProfile: UserProfile) => {
    setProfile(savedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(savedProfile));
    }
    setCurrentScreen('invite');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('create-profile');
  };

  const handleJoinSuccess = () => {
    setCurrentScreen('today');
  };

  const handleStartTodayFromInvite = () => {
    setCurrentScreen('home');
  };

  const handleNextQuestion = () => {
    const nextIdx = (questionIndex + 1) % QUESTION_BANK.length;
    setQuestionIndex(nextIdx);
    setPlayer1Answer(QUESTION_BANK[nextIdx].player1DefaultAnswer);
    localStorage.setItem('today_answer_locked', 'false');
    setSelectedReaction(null);
    setCurrentScreen('today');
  };

  const handleSaveToMemoryWall = () => {
    const newCard: MemoryCardProps = {
      id: `card-${Date.now()}`,
      category: activeQuestion.category,
      cardBg: isMatched ? '#E0ECB5' : '#F7E7CD',
      date: 'TODAY',
      question: activeQuestion.question,
      isMatched: isMatched,
      p1Name: profile.name || 'You',
      p1AvatarId: profile.avatarId,
      p1Color: profile.color,
      p1Answer: player1Answer,
      p2Name: partnerProfile.name || 'Alex',
      p2AvatarId: partnerProfile.avatarId,
      p2Color: partnerProfile.color,
      p2Answer: player2Answer,
      reactions: selectedReaction
        ? [{ emoji: selectedReaction === '1' ? '✨' : selectedReaction === '2' ? '💀' : selectedReaction === '3' ? '😍' : selectedReaction === '4' ? '🔥' : '👀', count: 1 }]
        : undefined,
    };

    setMemoryCards((prev) => [newCard, ...prev]);
  };

  const handleTabNavigate = (tab: NavTab) => {
    if (tab === 'today') {
      setCurrentScreen('home');
    } else if (tab === 'guess') {
      setCurrentScreen('guess');
    } else if (tab === 'scores') {
      setCurrentScreen('scores');
    } else if (tab === 'memory') {
      setCurrentScreen('memory');
    }
  };

  if (currentScreen === 'memory') {
    return (
      <MemoryWallScreen
        cards={memoryCards}
        userProfile={profile}
        onNavigateTab={handleTabNavigate}
      />
    );
  }

  if (currentScreen === 'friend-profile') {
    return (
      <FriendProfileScreen
        friendData={{
          name: partnerProfile.name || 'Sam',
          subtitle: 'Teal player, joined Sep 12',
          streakDays: streak,
          matchesCount: matches,
          guessWinsCount: guessWins,
          lastAnsweredTime: 'today, 8:42 PM',
        }}
        onBack={() => setCurrentScreen('profile')}
      />
    );
  }

  if (
    currentScreen === 'profile' ||
    currentScreen === 'sign-out' ||
    currentScreen === 'time-picker' ||
    currentScreen === 'leave-duo'
  ) {
    return (
      <ProfileScreen
        userProfile={profile}
        partnerProfile={partnerProfile}
        duoCreatedAt={duoCreatedAt}
        inviteCode={inviteCode}
        dailyReminderEnabled={dailyReminderEnabled}
        dailyReminderTime={dailyReminderTime}
        friendAlertsEnabled={friendAlertsEnabled}
        autoOpenSignOutModal={currentScreen === 'sign-out'}
        autoOpenTimePicker={currentScreen === 'time-picker'}
        autoOpenLeaveDuoModal={currentScreen === 'leave-duo'}
        onBack={() => setCurrentScreen('home')}
        onEditProfile={() => setCurrentScreen('create-profile')}
        onSignOut={handleSignOut}
        onLeaveDuo={handleLeaveDuo}
        onToggleDailyReminder={handleToggleDailyReminder}
        onChangeReminderTime={handleChangeReminderTime}
        onToggleFriendAlerts={handleToggleFriendAlerts}
        onOpenFriendProfile={() => setCurrentScreen('friend-profile')}
      />
    );
  }

  if (currentScreen === 'scores') {
    return (
      <ScoresScreen
        player1Profile={profile}
        player2Profile={partnerProfile}
        syncScore={syncScore}
        streak={streak}
        matches={matches}
        guessWins={guessWins}
        onOpenSettings={() => setCurrentScreen('profile')}
        onNavigateTab={handleTabNavigate}
      />
    );
  }

  if (currentScreen === 'guess') {
    return (
      <GuessScreen
        questionData={activeQuestion}
        realAnswer={player2Answer}
        streak={streak}
        onBack={() => setCurrentScreen('today')}
        onLockGuess={(_guess, isCorrect) => {
          if (isCorrect) {
            setSyncScore((prev) => Math.min(100, prev + 15));
            setGuessWins((prev) => prev + 1);
            setStreak((prev) => prev + 1);
          }
          if (isMatched) {
            setMatches((prev) => prev + 1);
          }
          setCurrentScreen('reveal');
        }}
        onNavigateTab={handleTabNavigate}
      />
    );
  }

  if (currentScreen === 'reveal') {
    return (
      <RevealScreen
        player1Name={profile.name || 'Player 1'}
        player1AvatarId={profile.avatarId}
        player1Color={profile.color}
        player2Name={partnerProfile.name || 'Alex'}
        player2AvatarId={partnerProfile.avatarId}
        player2Color={partnerProfile.color}
        questionData={activeQuestion}
        player1Answer={player1Answer}
        player2Answer={player2Answer}
        syncScore={syncScore}
        isMatched={isMatched}
        selectedReaction={selectedReaction}
        onSelectReaction={(reactionId) => {
          setSelectedReaction(reactionId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('reveal_selected_reaction', reactionId);
          }
        }}
        onSaveToMemoryWall={handleSaveToMemoryWall}
        onNextQuestion={handleNextQuestion}
        onBack={() => setCurrentScreen('locked')}
        onNavigateTab={handleTabNavigate}
      />
    );
  }

  if (currentScreen === 'locked') {
    return (
      <AnswerLockedScreen
        friendName={partnerProfile.name || 'Alex'}
        onEditAnswer={() => {
          localStorage.setItem('today_answer_locked', 'false');
          setCurrentScreen('today');
        }}
        onOpenSettings={() => setCurrentScreen('profile')}
        onNavigateTab={handleTabNavigate}
        onPlayer2Answered={() => {
          setCurrentScreen('guess');
        }}
      />
    );
  }

  if (currentScreen === 'game-settings') {
    return (
      <GameSettingsScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'home' || currentScreen === 'today') {
    return (
      <HomeScreen
        onOpenSettings={() => setCurrentScreen('profile')}
        onOpenFriendProfile={() => setCurrentScreen('friend-profile')}
        onNavigateTab={handleTabNavigate}
        onOpenGameSettings={() => setCurrentScreen('game-settings')}
      />
    );
  }

  if (currentScreen === 'join-code') {
    return (
      <JoinCodeScreen
        validCode={inviteCode}
        onBack={handleBackToWelcome}
        onCreateDuo={handleGetStarted}
        onJoinSuccess={handleJoinSuccess}
      />
    );
  }

  if (currentScreen === 'invite') {
    return (
      <InviteFriendScreen
        userProfile={profile}
        inviteCode={inviteCode}
        onBack={handleBackToProfile}
        onEnterGame={handleStartTodayFromInvite}
      />
    );
  }

  if (currentScreen === 'create-profile') {
    return (
      <CreateProfileScreen
        initialProfile={profile}
        onBack={handleBackToWelcome}
        onContinue={handleContinueProfile}
      />
    );
  }

  return (
    <WelcomeScreen
      onGetStarted={handleGetStarted}
      onJoinCode={handleOpenJoinCode}
    />
  );
}

export default App;
