import { useState } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CreateProfileScreen, UserProfile } from './screens/CreateProfileScreen';
import { InviteFriendScreen, generateInviteCode } from './screens/InviteFriendScreen';
import { JoinCodeScreen } from './screens/JoinCodeScreen';
import { TodayQuestionScreen } from './screens/TodayQuestionScreen';
import { AnswerLockedScreen } from './screens/AnswerLockedScreen';
import { RevealScreen } from './screens/RevealScreen';
import { NavTab } from './components/BottomNav';

type ScreenType =
  | 'welcome'
  | 'create-profile'
  | 'invite'
  | 'join-code'
  | 'today'
  | 'locked'
  | 'reveal';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('screen') as ScreenType | null;
      if (
        param &&
        [
          'welcome',
          'create-profile',
          'invite',
          'join-code',
          'today',
          'locked',
          'reveal',
        ].includes(param)
      ) {
        return param;
      }
    }
    return 'welcome';
  });

  const [profile, setProfile] = useState<UserProfile>({
    avatarId: 1,
    name: '',
    color: 'pink',
  });
  const [inviteCode] = useState<string>(() => generateInviteCode());

  // App state for Reveal screen: answers, sync score, match status, and reaction
  const [player1Answer] = useState<string>('Anchovies on pizza.');
  const [player2Answer] = useState<string>('Anchovies on pizza.');
  const [syncScore] = useState<number>(74);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_selected_reaction');
    }
    return null;
  });

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
    setCurrentScreen('invite');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('create-profile');
  };

  const handleJoinSuccess = () => {
    setCurrentScreen('today');
  };

  const handleStartTodayFromInvite = () => {
    setCurrentScreen('today');
  };

  if (currentScreen === 'reveal') {
    return (
      <RevealScreen
        player1Name={profile.name || 'Player 1'}
        player2Name="Player 2"
        player1Answer={player1Answer}
        player2Answer={player2Answer}
        syncScore={syncScore}
        isMatched={isMatched}
        selectedReaction={selectedReaction}
        onSelectReaction={(reactionId) => {
          setSelectedReaction(reactionId);
        }}
        onBack={() => setCurrentScreen('locked')}
        onNavigateTab={(tab: NavTab) => {
          if (tab === 'today') {
            setCurrentScreen('reveal');
          }
        }}
      />
    );
  }

  if (currentScreen === 'locked') {
    return (
      <AnswerLockedScreen
        friendName="Player 2"
        onEditAnswer={() => {
          localStorage.setItem('today_answer_locked', 'false');
          setCurrentScreen('today');
        }}
        onOpenSettings={() => setCurrentScreen('welcome')}
        onNavigateTab={(tab: NavTab) => {
          if (tab === 'today') {
            setCurrentScreen('locked');
          }
        }}
        onPlayer2Answered={() => {
          setCurrentScreen('reveal');
        }}
      />
    );
  }

  if (currentScreen === 'today') {
    return (
      <TodayQuestionScreen
        onOpenSettings={() => setCurrentScreen('welcome')}
        onLockInSuccess={() => setCurrentScreen('locked')}
        onNavigateTab={() => {}}
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
