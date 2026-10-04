export interface GuessOption {
  id: 'pink' | 'yellow' | 'cream' | 'green';
  text: string;
}

export interface QuestionData {
  id: string;
  category: 'Food' | 'Fears' | 'Hot takes' | 'Deep' | 'Habits' | 'Childhood';
  question: string;
  questionLines?: string[];
  player1DefaultAnswer: string;
  player2Answer: string;
  guessOptions: GuessOption[];
  correctOptionId: 'pink' | 'yellow' | 'cream' | 'green';
}

export const QUESTION_BANK: QuestionData[] = [
  {
    id: 'q1',
    category: 'Food',
    question: "What’s the worst food you’ve ever tried?",
    questionLines: ["What’s the worst", "food you’ve ever", "tried?"],
    player1DefaultAnswer: "Anchovies on pizza.",
    player2Answer: "Anchovies on pizza.",
    guessOptions: [
      { id: 'pink', text: "Fried crickets" },
      { id: 'yellow', text: "Raw oysters" },
      { id: 'cream', text: "Anchovies on pizza" },
      { id: 'green', text: "Durian" },
    ],
    correctOptionId: 'cream',
  },
  {
    id: 'q2',
    category: 'Fears',
    question: "What’s a fear you’d never tell anyone?",
    questionLines: ["What’s a fear you’d", "never tell", "anyone?"],
    player1DefaultAnswer: "Escalators stopping suddenly.",
    player2Answer: "Deep open ocean.",
    guessOptions: [
      { id: 'pink', text: "Spiders in shoes" },
      { id: 'yellow', text: "Deep ocean" },
      { id: 'cream', text: "Elevators" },
      { id: 'green', text: "Speaking in public" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 'q3',
    category: 'Hot takes',
    question: "What’s a hill you’re willing to die on?",
    questionLines: ["What’s a hill you’re", "willing to die", "on?"],
    player1DefaultAnswer: "Cereal is a soup.",
    player2Answer: "Pineapple belongs on pizza.",
    guessOptions: [
      { id: 'pink', text: "Pineapple on pizza" },
      { id: 'yellow', text: "Cats > dogs" },
      { id: 'cream', text: "Cold brew > espresso" },
      { id: 'green', text: "Marvel peaked in 2019" },
    ],
    correctOptionId: 'pink',
  },
  {
    id: 'q4',
    category: 'Deep',
    question: "What’s a piece of advice that changed your life?",
    questionLines: ["What’s a piece of", "advice that changed", "your life?"],
    player1DefaultAnswer: "Don't take criticism from someone you wouldn't ask for advice.",
    player2Answer: "Done is better than perfect.",
    guessOptions: [
      { id: 'pink', text: "Never go to bed angry" },
      { id: 'yellow', text: "Trust your gut" },
      { id: 'cream', text: "Done is better than perfect" },
      { id: 'green', text: "Keep moving forward" },
    ],
    correctOptionId: 'cream',
  },
  {
    id: 'q5',
    category: 'Habits',
    question: "What’s your weirdest daily habit?",
    questionLines: ["What’s your weirdest", "daily habit", "ever?"],
    player1DefaultAnswer: "Checking if door is locked 3 times.",
    player2Answer: "Smelling coffee beans before brewing.",
    guessOptions: [
      { id: 'pink', text: "Double alarm checking" },
      { id: 'yellow', text: "Walking backwards upstairs" },
      { id: 'cream', text: "Smelling coffee beans" },
      { id: 'green', text: "Organizing fridge by color" },
    ],
    correctOptionId: 'green',
  },
];

export const AVATAR_DATA = [
  { id: 1, name: 'Messy Hair Boy', face: '/assets/avatars/avatar-1.webp', blob: '/assets/blobs/avatar-blob-1.webp', defaultColor: 'salmon' },
  { id: 2, name: 'Heart Clip Girl', face: '/assets/avatars/avatar-2.webp', blob: '/assets/blobs/avatar-blob-2.webp', defaultColor: 'teal' },
  { id: 3, name: 'Round Glasses Boy', face: '/assets/avatars/avatar-3.webp', blob: '/assets/blobs/avatar-blob-3.webp', defaultColor: 'indigo' },
  { id: 4, name: 'Top Bun Girl', face: '/assets/avatars/avatar-4.webp', blob: '/assets/blobs/avatar-blob-4.webp', defaultColor: 'pink' },
  { id: 5, name: 'Bucket Hat Boy', face: '/assets/avatars/avatar-5.webp', blob: '/assets/blobs/avatar-blob-5.webp', defaultColor: 'lime' },
  { id: 6, name: 'Headphones Girl', face: '/assets/avatars/avatar-6.webp', blob: '/assets/blobs/avatar-blob-6.webp', defaultColor: 'orange' },
] as const;

export function getAvatarFaceSrc(avatarId?: number): string {
  const safeId = avatarId && avatarId >= 1 && avatarId <= 20 ? avatarId : 1;
  return `/assets/avatars/avatar-${safeId}.webp`;
}

export function getAvatarBlobSrc(avatarId?: number, color?: string): string {
  if (color === 'teal') return '/assets/blobs/avatar-blob-2.webp';
  if (color === 'salmon') return '/assets/blobs/avatar-blob-1.webp';
  if (color === 'pink') return '/assets/blobs/avatar-blob-4.webp';
  if (color === 'blue' || color === 'indigo') return '/assets/blobs/avatar-blob-3.webp';
  
  const safeId = avatarId && avatarId >= 1 && avatarId <= 20 ? avatarId : 1;
  return `/assets/blobs/avatar-blob-${safeId}.webp`;
}

export const INITIAL_CATEGORY_STATS = [
  {
    name: 'Food',
    pct: '85%',
    bg: '#FAD968',
    iconSrc: '/assets/scores/icon-category-food-pink-pizza.webp',
    iconW: 'w-[28px] sm:w-[32px]',
  },
  {
    name: 'Dreams',
    pct: '80%',
    bg: '#F8B6D2',
    iconSrc: '/assets/scores/icon-category-dreams-blue-moon.webp',
    iconW: 'w-[28px] sm:w-[32px]',
  },
  {
    name: 'Fears',
    pct: '65%',
    bg: '#91A9D4',
    iconSrc: '/assets/scores/icon-category-fears-green-scream.webp',
    iconW: 'w-[28px] sm:w-[32px]',
  },
];
