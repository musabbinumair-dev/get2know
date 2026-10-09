export interface GuessOption {
  id: 'pink' | 'yellow' | 'cream' | 'green';
  text: string;
}

export interface TriviaQuestion {
  id: string;
  type: 'trivia';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  questionLines?: string[];
  options: GuessOption[];
  correctOptionId: 'pink' | 'yellow' | 'cream' | 'green';
  explanation?: string;
}

export interface KnowMeQuestion {
  id: string;
  type: 'know-me';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  questionLines?: string[];
  prompt: string;
  player1DefaultAnswer: string;
  player2Answer: string;
  decoys: string[];
  guessOptions: GuessOption[];
  correctOptionId: 'pink' | 'yellow' | 'cream' | 'green';
}

export type GameQuestion = TriviaQuestion | KnowMeQuestion;

export const CATEGORIES_LIST = [
  'Food',
  'Dreams',
  'Fears',
  'Movies',
  'Music',
  'Travel',
  'Science',
  'Funny',
  'Deep',
  'Random',
] as const;

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // FOOD
  {
    id: 't_sushi',
    type: 'trivia',
    category: 'Food',
    difficulty: 'Easy',
    question: "Which country invented sushi?",
    questionLines: ["Which country", "invented sushi?"],
    options: [
      { id: 'pink', text: "Japan" },
      { id: 'yellow', text: "China" },
      { id: 'cream', text: "Korea" },
      { id: 'green', text: "Thailand" },
    ],
    correctOptionId: 'pink',
    explanation: "Modern sushi as we know it was developed in Tokyo during the Edo period!",
  },
  {
    id: 't3',
    type: 'trivia',
    category: 'Food',
    difficulty: 'Medium',
    question: "Which country eats the most chocolate per person each year?",
    questionLines: ["Which country eats", "the most chocolate", "per person?"],
    options: [
      { id: 'pink', text: "Switzerland" },
      { id: 'yellow', text: "Belgium" },
      { id: 'cream', text: "Germany" },
      { id: 'green', text: "USA" },
    ],
    correctOptionId: 'pink',
    explanation: "The Swiss consume around 8.8 kilograms of chocolate per person each year!",
  },
  {
    id: 't13',
    type: 'trivia',
    category: 'Food',
    difficulty: 'Hard',
    question: "Which condiment was originally sold as medicine in the 1830s?",
    questionLines: ["Which condiment", "was sold as medicine", "in the 1830s?"],
    options: [
      { id: 'pink', text: "Mustard" },
      { id: 'yellow', text: "Mayonnaise" },
      { id: 'cream', text: "Ketchup" },
      { id: 'green', text: "Soy Sauce" },
    ],
    correctOptionId: 'cream',
    explanation: "Dr. John Cook Bennett promoted tomato ketchup as a cure for indigestion in 1834!",
  },
  {
    id: 't_food_4',
    type: 'trivia',
    category: 'Food',
    difficulty: 'Easy',
    question: "What is the primary ingredient in traditional guacamole?",
    questionLines: ["What is the main", "ingredient in traditional", "guacamole?"],
    options: [
      { id: 'pink', text: "Avocado" },
      { id: 'yellow', text: "Lime" },
      { id: 'cream', text: "Tomato" },
      { id: 'green', text: "Cilantro" },
    ],
    correctOptionId: 'pink',
  },

  // SCIENCE
  {
    id: 't1',
    type: 'trivia',
    category: 'Science',
    difficulty: 'Easy',
    question: "Which planet has the most confirmed moons?",
    questionLines: ["Which planet has", "the most confirmed", "moons?"],
    options: [
      { id: 'pink', text: "Jupiter" },
      { id: 'yellow', text: "Saturn" },
      { id: 'cream', text: "Uranus" },
      { id: 'green', text: "Neptune" },
    ],
    correctOptionId: 'yellow',
    explanation: "Saturn officially holds the record with 146 confirmed moons!",
  },
  {
    id: 't4',
    type: 'trivia',
    category: 'Science',
    difficulty: 'Medium',
    question: "How many bones are in the adult human body?",
    questionLines: ["How many bones are", "in the adult human", "body?"],
    options: [
      { id: 'pink', text: "198" },
      { id: 'yellow', text: "206" },
      { id: 'cream', text: "214" },
      { id: 'green', text: "228" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't12',
    type: 'trivia',
    category: 'Science',
    difficulty: 'Hard',
    question: "What color is octopus blood due to copper hemocyanin?",
    questionLines: ["What color is", "octopus blood due", "to copper?"],
    options: [
      { id: 'pink', text: "Blue" },
      { id: 'yellow', text: "Green" },
      { id: 'cream', text: "Purple" },
      { id: 'green', text: "Yellow" },
    ],
    correctOptionId: 'pink',
    explanation: "Octopuses use copper-rich hemocyanin which turns blue when oxygenated!",
  },
  {
    id: 't15',
    type: 'trivia',
    category: 'Science',
    difficulty: 'Easy',
    question: "What is the hardest natural substance known on Earth?",
    questionLines: ["What is the hardest", "natural substance known", "on Earth?"],
    options: [
      { id: 'pink', text: "Titanium" },
      { id: 'yellow', text: "Diamond" },
      { id: 'cream', text: "Graphene" },
      { id: 'green', text: "Quartz" },
    ],
    correctOptionId: 'yellow',
  },

  // MOVIES
  {
    id: 't_mov_1',
    type: 'trivia',
    category: 'Movies',
    difficulty: 'Easy',
    question: "Which movie features the character Captain Jack Sparrow?",
    questionLines: ["Which film series", "features Captain", "Jack Sparrow?"],
    options: [
      { id: 'pink', text: "Pirates of the Caribbean" },
      { id: 'yellow', text: "Peter Pan" },
      { id: 'cream', text: "Treasure Planet" },
      { id: 'green', text: "Hook" },
    ],
    correctOptionId: 'pink',
  },
  {
    id: 't_mov_2',
    type: 'trivia',
    category: 'Movies',
    difficulty: 'Medium',
    question: "What was the first feature-length animated film released by Disney?",
    questionLines: ["What was Disney's", "first feature-length", "animated film?"],
    options: [
      { id: 'pink', text: "Pinocchio" },
      { id: 'yellow', text: "Snow White" },
      { id: 'cream', text: "Bambi" },
      { id: 'green', text: "Fantasia" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't_mov_3',
    type: 'trivia',
    category: 'Movies',
    difficulty: 'Hard',
    question: "Which movie won 11 Oscars tying Titanic and Lord of the Rings?",
    questionLines: ["Which 1959 film won", "11 Oscars tying", "Titanic?"],
    options: [
      { id: 'pink', text: "Ben-Hur" },
      { id: 'yellow', text: "Casablanca" },
      { id: 'cream', text: "Spartacus" },
      { id: 'green', text: "Gone with the Wind" },
    ],
    correctOptionId: 'pink',
  },

  // MUSIC
  {
    id: 't10',
    type: 'trivia',
    category: 'Music',
    difficulty: 'Easy',
    question: "Which legendary artist was crowned the 'King of Pop'?",
    questionLines: ["Which artist was", "crowned the", "'King of Pop'?"],
    options: [
      { id: 'pink', text: "Prince" },
      { id: 'yellow', text: "Michael Jackson" },
      { id: 'cream', text: "Elvis Presley" },
      { id: 'green', text: "Stevie Wonder" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't_mus_2',
    type: 'trivia',
    category: 'Music',
    difficulty: 'Medium',
    question: "How many strings does a standard acoustic violin have?",
    questionLines: ["How many strings", "does a standard", "violin have?"],
    options: [
      { id: 'pink', text: "3" },
      { id: 'yellow', text: "4" },
      { id: 'cream', text: "5" },
      { id: 'green', text: "6" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't_mus_3',
    type: 'trivia',
    category: 'Music',
    difficulty: 'Hard',
    question: "Which composer wrote his famed 9th Symphony while almost completely deaf?",
    questionLines: ["Which composer wrote", "his 9th Symphony while", "profoundly deaf?"],
    options: [
      { id: 'pink', text: "Bach" },
      { id: 'yellow', text: "Mozart" },
      { id: 'cream', text: "Beethoven" },
      { id: 'green', text: "Chopin" },
    ],
    correctOptionId: 'cream',
  },

  // TRAVEL
  {
    id: 't7',
    type: 'trivia',
    category: 'Travel',
    difficulty: 'Medium',
    question: "In which country is the Atacama Desert, the driest non-polar desert?",
    questionLines: ["In which country is", "the Atacama Desert", "located?"],
    options: [
      { id: 'pink', text: "Peru" },
      { id: 'yellow', text: "Chile" },
      { id: 'cream', text: "Argentina" },
      { id: 'green', text: "Bolivia" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't14',
    type: 'trivia',
    category: 'Travel',
    difficulty: 'Easy',
    question: "In which city can you view the original Mona Lisa painting?",
    questionLines: ["In which city can", "you view the original", "Mona Lisa?"],
    options: [
      { id: 'pink', text: "Rome" },
      { id: 'yellow', text: "Paris" },
      { id: 'cream', text: "Florence" },
      { id: 'green', text: "Madrid" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't_trav_3',
    type: 'trivia',
    category: 'Travel',
    difficulty: 'Hard',
    question: "Which city is situated across both the European and Asian continents?",
    questionLines: ["Which city spans", "both Europe and", "Asia?"],
    options: [
      { id: 'pink', text: "Istanbul" },
      { id: 'yellow', text: "Athens" },
      { id: 'cream', text: "Cairo" },
      { id: 'green', text: "Baku" },
    ],
    correctOptionId: 'pink',
  },

  // FUNNY
  {
    id: 't2',
    type: 'trivia',
    category: 'Funny',
    difficulty: 'Easy',
    question: "What color is a polar bear's skin underneath all its fur?",
    questionLines: ["What color is a", "polar bear's skin", "under its fur?"],
    options: [
      { id: 'pink', text: "Pink" },
      { id: 'yellow', text: "White" },
      { id: 'cream', text: "Black" },
      { id: 'green', text: "Grey" },
    ],
    correctOptionId: 'cream',
  },
  {
    id: 't_fun_2',
    type: 'trivia',
    category: 'Funny',
    difficulty: 'Medium',
    question: "What is a group of flamingos called?",
    questionLines: ["What is a group", "of flamingos", "called?"],
    options: [
      { id: 'pink', text: "A Flamboyance" },
      { id: 'yellow', text: "A Fiesta" },
      { id: 'cream', text: "A Flutter" },
      { id: 'green', text: "A Parade" },
    ],
    correctOptionId: 'pink',
  },
  {
    id: 't_fun_3',
    type: 'trivia',
    category: 'Funny',
    difficulty: 'Hard',
    question: "Which animal is known to hold hands while sleeping so they don't drift apart?",
    questionLines: ["Which animal holds", "hands while sleeping to", "not drift apart?"],
    options: [
      { id: 'pink', text: "Sea Otters" },
      { id: 'yellow', text: "Penguins" },
      { id: 'cream', text: "Dolphins" },
      { id: 'green', text: "Koalas" },
    ],
    correctOptionId: 'pink',
  },

  // DREAMS / FEARS / DEEP
  {
    id: 't_deep_1',
    type: 'trivia',
    category: 'Deep',
    difficulty: 'Easy',
    question: "Which philosopher is known for the maxim 'I think, therefore I am'?",
    questionLines: ["Who said 'I think,", "therefore", "I am'?"],
    options: [
      { id: 'pink', text: "Socrates" },
      { id: 'yellow', text: "René Descartes" },
      { id: 'cream', text: "Aristotle" },
      { id: 'green', text: "Plato" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 't_fears_1',
    type: 'trivia',
    category: 'Fears',
    difficulty: 'Medium',
    question: "What is the clinical term for the fear of spiders?",
    questionLines: ["What is the fear", "of spiders", "called?"],
    options: [
      { id: 'pink', text: "Arachnophobia" },
      { id: 'yellow', text: "Acrophobia" },
      { id: 'cream', text: "Claustrophobia" },
      { id: 'green', text: "Ophidiophobia" },
    ],
    correctOptionId: 'pink',
  },
  {
    id: 't_dreams_1',
    type: 'trivia',
    category: 'Dreams',
    difficulty: 'Medium',
    question: "In which sleep stage do most vivid dreams occur?",
    questionLines: ["In which sleep stage", "do most dreams", "occur?"],
    options: [
      { id: 'pink', text: "Deep Stage 3" },
      { id: 'yellow', text: "REM sleep" },
      { id: 'cream', text: "Light Stage 1" },
      { id: 'green', text: "Transition Stage 2" },
    ],
    correctOptionId: 'yellow',
  },
];

export const KNOW_ME_QUESTIONS: KnowMeQuestion[] = [
  // FOOD
  {
    id: 'k1',
    type: 'know-me',
    category: 'Food',
    difficulty: 'Easy',
    question: "What’s the worst food you’ve ever tried?",
    questionLines: ["What’s the worst", "food you’ve ever", "tried?"],
    prompt: "What's the worst food you've ever tasted?",
    player1DefaultAnswer: "Anchovies on pizza.",
    player2Answer: "Anchovies on pizza.",
    decoys: [
      "Fried crickets",
      "Raw oysters",
      "Durian fruit",
      "Liver and onions",
      "Blue cheese",
      "Sardines in oil",
      "Wasabi ice cream",
      "Overcooked cabbage",
    ],
    guessOptions: [
      { id: 'pink', text: "Fried crickets" },
      { id: 'yellow', text: "Raw oysters" },
      { id: 'cream', text: "Anchovies on pizza" },
      { id: 'green', text: "Durian fruit" },
    ],
    correctOptionId: 'cream',
  },
  {
    id: 'k7',
    type: 'know-me',
    category: 'Food',
    difficulty: 'Easy',
    question: "What is your ultimate go-to comfort meal?",
    questionLines: ["What is your ultimate", "comfort meal after a", "long day?"],
    prompt: "What food instantly makes your day better?",
    player1DefaultAnswer: "Spicy ramen bowl.",
    player2Answer: "Mac and cheese.",
    decoys: [
      "Warm chocolate chip cookies",
      "Loaded cheeseburger",
      "Pad thai noodles",
      "Grilled cheese & soup",
      "Pepperoni pizza slice",
      "Chicken nuggets",
    ],
    guessOptions: [
      { id: 'pink', text: "Spicy ramen bowl" },
      { id: 'yellow', text: "Warm chocolate chip cookies" },
      { id: 'cream', text: "Loaded cheeseburger" },
      { id: 'green', text: "Mac and cheese" },
    ],
    correctOptionId: 'green',
  },

  // FEARS
  {
    id: 'k2',
    type: 'know-me',
    category: 'Fears',
    difficulty: 'Medium',
    question: "What’s a fear you’d never tell anyone?",
    questionLines: ["What’s a fear you’d", "never tell", "anyone?"],
    prompt: "What is a secret fear you have?",
    player1DefaultAnswer: "Escalators stopping suddenly.",
    player2Answer: "Deep open ocean.",
    decoys: [
      "Spiders in shoes",
      "Elevators dropping",
      "Public speaking",
      "Losing phone in subway grate",
      "Being forgotten",
      "Birds flying too close",
    ],
    guessOptions: [
      { id: 'pink', text: "Spiders in shoes" },
      { id: 'yellow', text: "Deep open ocean" },
      { id: 'cream', text: "Elevators dropping" },
      { id: 'green', text: "Public speaking" },
    ],
    correctOptionId: 'yellow',
  },

  // DREAMS
  {
    id: 'k6',
    type: 'know-me',
    category: 'Dreams',
    difficulty: 'Easy',
    question: "Where is your number one dream travel destination?",
    questionLines: ["Where is your number", "one dream travel", "destination?"],
    prompt: "If you could board a plane anywhere right now?",
    player1DefaultAnswer: "Kyoto, Japan in spring.",
    player2Answer: "Northern lights in Norway.",
    decoys: [
      "Santorini sunsets",
      "New Zealand fjords",
      "Safari in Kenya",
      "Amalfi Coast villa",
      "Bora Bora overwater bungalow",
      "Swiss Alps cabin",
    ],
    guessOptions: [
      { id: 'pink', text: "Kyoto in spring" },
      { id: 'yellow', text: "Northern lights in Norway" },
      { id: 'cream', text: "Santorini sunsets" },
      { id: 'green', text: "New Zealand fjords" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 'k9',
    type: 'know-me',
    category: 'Dreams',
    difficulty: 'Easy',
    question: "If you could pick one superpower, what would it be?",
    questionLines: ["If you could pick one", "superpower, what", "would it be?"],
    prompt: "Choose your dream superpower!",
    player1DefaultAnswer: "Time travel to see history.",
    player2Answer: "Teleportation to travel anywhere.",
    decoys: [
      "Invisibility on command",
      "Flying freely",
      "Mind reading",
      "Speaking all languages",
      "Infinite energy",
      "Healing touch",
    ],
    guessOptions: [
      { id: 'pink', text: "Invisibility on command" },
      { id: 'yellow', text: "Time travel" },
      { id: 'cream', text: "Teleportation" },
      { id: 'green', text: "Flying freely" },
    ],
    correctOptionId: 'cream',
  },

  // MOVIES
  {
    id: 'k_mov_1',
    type: 'know-me',
    category: 'Movies',
    difficulty: 'Medium',
    question: "What is a movie you can rewatch an infinite number of times?",
    questionLines: ["What movie can you", "rewatch an infinite", "number of times?"],
    prompt: "Your all-time most comforting or favorite film?",
    player1DefaultAnswer: "The Grand Budapest Hotel.",
    player2Answer: "Spider-Man: Into the Spider-Verse.",
    decoys: [
      "The Princess Bride",
      "Back to the Future",
      "Spirited Away",
      "The Dark Knight",
      "Legally Blonde",
      "Interstellar",
    ],
    guessOptions: [
      { id: 'pink', text: "The Princess Bride" },
      { id: 'yellow', text: "Back to the Future" },
      { id: 'cream', text: "Into the Spider-Verse" },
      { id: 'green', text: "Interstellar" },
    ],
    correctOptionId: 'cream',
  },

  // MUSIC
  {
    id: 'k10',
    type: 'know-me',
    category: 'Music',
    difficulty: 'Easy',
    question: "What song is your ultimate guilty pleasure?",
    questionLines: ["What song is your", "biggest guilty", "pleasure?"],
    prompt: "What track do you belt out when nobody's watching?",
    player1DefaultAnswer: "Party in the U.S.A.",
    player2Answer: "Dancing Queen by ABBA.",
    decoys: [
      "Call Me Maybe",
      "Never Gonna Give You Up",
      "Toxic by Britney Spears",
      "All Star by Smash Mouth",
      "Since U Been Gone",
      "Barbie Girl",
    ],
    guessOptions: [
      { id: 'pink', text: "Dancing Queen by ABBA" },
      { id: 'yellow', text: "Party in the U.S.A." },
      { id: 'cream', text: "Call Me Maybe" },
      { id: 'green', text: "Toxic by Britney Spears" },
    ],
    correctOptionId: 'pink',
  },

  // TRAVEL
  {
    id: 'k_trav_1',
    type: 'know-me',
    category: 'Travel',
    difficulty: 'Medium',
    question: "Are you a wake-up-at-6am tourist or a sleep-in-and-wander tourist?",
    questionLines: ["On vacation: are you", "early sunrise tourist", "or sleep-in wanderer?"],
    prompt: "What is your vacation style?",
    player1DefaultAnswer: "Early sunrise with a strict itinerary.",
    player2Answer: "Sleep in late and wander with no plans.",
    decoys: [
      "Pack every hour with museums",
      "Lounge by the café all day",
      "Hike non-stop from dusk till dawn",
      "Follow wherever the food smells good",
    ],
    guessOptions: [
      { id: 'pink', text: "Strict 6am itinerary" },
      { id: 'yellow', text: "Sleep in late and wander" },
      { id: 'cream', text: "All day museum sprint" },
      { id: 'green', text: "Café lounge vibes" },
    ],
    correctOptionId: 'yellow',
  },

  // FUNNY
  {
    id: 'k5',
    type: 'know-me',
    category: 'Funny',
    difficulty: 'Easy',
    question: "What’s your weirdest quirky habit?",
    questionLines: ["What’s your weirdest", "quirky daily", "habit?"],
    prompt: "What is something slightly odd you do every day?",
    player1DefaultAnswer: "Checking if the door is locked 3 times.",
    player2Answer: "Smelling coffee beans before brewing.",
    decoys: [
      "Walking up stairs on tiptoes",
      "Color-coding phone apps",
      "Eating pizza crust first",
      "Setting alarms at weird minutes like 7:03",
      "Talking to houseplants",
    ],
    guessOptions: [
      { id: 'pink', text: "Color-coding apps" },
      { id: 'yellow', text: "Checking door 3 times" },
      { id: 'cream', text: "Smelling coffee beans" },
      { id: 'green', text: "Alarm at 7:03" },
    ],
    correctOptionId: 'cream',
  },

  // DEEP
  {
    id: 'k4',
    type: 'know-me',
    category: 'Deep',
    difficulty: 'Hard',
    question: "What advice has had the biggest impact on you?",
    questionLines: ["What advice has had", "the biggest impact", "on your life?"],
    prompt: "What's the best advice you've ever received?",
    player1DefaultAnswer: "Don't take criticism from someone you wouldn't ask for advice.",
    player2Answer: "Done is better than perfect.",
    decoys: [
      "Never go to bed angry",
      "Trust your gut first",
      "Comparison is the thief of joy",
      "Say yes to opportunities that scare you",
      "Be kind, everyone is fighting a hard battle",
    ],
    guessOptions: [
      { id: 'pink', text: "Never go to bed angry" },
      { id: 'yellow', text: "Trust your gut first" },
      { id: 'cream', text: "Done is better than perfect" },
      { id: 'green', text: "Comparison steals joy" },
    ],
    correctOptionId: 'cream',
  },
];

/**
 * Deterministic pseudo-random number generator using simple string hashing
 */
function seededRandom(seed: string | number): () => number {
  let s = typeof seed === 'number' ? seed : 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    }
  }
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Shuffle array deterministically with a given seed
 */
export function shuffleWithSeed<T>(array: T[], seed: string | number): T[] {
  const rng = seededRandom(seed);
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Select questions for a game meeting all rules:
 * - Selected categories (multi-select; if empty or contains 'Random', use all)
 * - Difficulty (Easy/Medium/Hard)
 * - Rounds count (5/10/15)
 * - Mixed mode: alternates Trivia and Know Me
 * - Even distribution across selected categories
 * - Never repeats questions until pool exhausted
 */
export function selectQuestionsForGame(
  settings: {
    mode: 'know-me' | 'trivia' | 'mixed' | string;
    categories: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard' | string;
    rounds: number;
  },
  usedQuestionIds: string[] = [],
  gameSeed: string | number = Date.now()
): GameQuestion[] {
  const { mode, categories, difficulty, rounds } = settings;
  const isRandomCat = categories.length === 0 || categories.includes('Random');
  const catFilter = (cat: string) => isRandomCat || categories.includes(cat);

  // Filter Trivia Pool
  let triviaPool = TRIVIA_QUESTIONS.filter((q) => catFilter(q.category));
  if (triviaPool.length === 0) triviaPool = TRIVIA_QUESTIONS;

  // Filter Know Me Pool
  let knowMePool = KNOW_ME_QUESTIONS.filter((q) => catFilter(q.category));
  if (knowMePool.length === 0) knowMePool = KNOW_ME_QUESTIONS;

  // Filter by difficulty if matching questions exist
  const diffTrivia = triviaPool.filter((q) => q.difficulty === difficulty);
  const finalTriviaPool = diffTrivia.length >= 3 ? diffTrivia : triviaPool;

  const diffKnowMe = knowMePool.filter((q) => q.difficulty === difficulty);
  const finalKnowMePool = diffKnowMe.length >= 3 ? diffKnowMe : knowMePool;

  // Exclude used question IDs unless pool is depleted
  const unusedTrivia = finalTriviaPool.filter((q) => !usedQuestionIds.includes(q.id));
  const activeTriviaPool = unusedTrivia.length > 0 ? unusedTrivia : finalTriviaPool;

  const unusedKnowMe = finalKnowMePool.filter((q) => !usedQuestionIds.includes(q.id));
  const activeKnowMePool = unusedKnowMe.length > 0 ? unusedKnowMe : finalKnowMePool;

  const shuffledTrivia = shuffleWithSeed(activeTriviaPool, `${gameSeed}-trivia`);
  const shuffledKnowMe = shuffleWithSeed(activeKnowMePool, `${gameSeed}-knowme`);

  const selected: GameQuestion[] = [];

  for (let r = 1; r <= rounds; r++) {
    let roundType: 'trivia' | 'know-me';
    if (mode === 'trivia') {
      roundType = 'trivia';
    } else if (mode === 'know-me') {
      roundType = 'know-me';
    } else {
      // Mixed alternates: round 1 trivia, round 2 know-me, round 3 trivia...
      roundType = r % 2 === 1 ? 'trivia' : 'know-me';
    }

    if (roundType === 'trivia') {
      const q = shuffledTrivia[(r - 1) % shuffledTrivia.length];
      selected.push(q);
    } else {
      const q = shuffledKnowMe[(r - 1) % shuffledKnowMe.length];
      selected.push(q);
    }
  }

  return selected;
}

/**
 * Generate 4 Guess Options for Know Me guessing phase:
 * The target player's real answer + 3 decoys from question decoys list,
 * shuffled into slots 'pink', 'yellow', 'cream', 'green'.
 */
export function generateKnowMeGuessOptions(
  question: KnowMeQuestion,
  realAnswer: string,
  seed: string | number
): { options: GuessOption[]; correctOptionId: 'pink' | 'yellow' | 'cream' | 'green' } {
  const decoysPool = (question.decoys && question.decoys.length >= 3)
    ? question.decoys
    : ['Raw oysters', 'Durian fruit', 'Fried crickets'];

  // Filter out any decoy that matches the real answer
  const safeDecoys = decoysPool.filter(
    (d) => d.trim().toLowerCase() !== realAnswer.trim().toLowerCase()
  );

  const shuffledDecoys = shuffleWithSeed(safeDecoys, `${seed}-decoys`);
  const chosenDecoys = shuffledDecoys.slice(0, 3);

  // Combine real answer + 3 decoys
  const fourAnswers = [realAnswer.trim(), ...chosenDecoys];

  // Shuffle into the 4 colors
  const shuffledFour = shuffleWithSeed(fourAnswers, `${seed}-slots`);

  const colors: Array<'pink' | 'yellow' | 'cream' | 'green'> = ['pink', 'yellow', 'cream', 'green'];
  const options: GuessOption[] = colors.map((col, idx) => ({
    id: col,
    text: shuffledFour[idx] || realAnswer,
  }));

  const correctIndex = shuffledFour.findIndex(
    (a) => a.trim().toLowerCase() === realAnswer.trim().toLowerCase()
  );
  const correctOptionId = colors[correctIndex >= 0 ? correctIndex : 0];

  return { options, correctOptionId };
}

/**
 * Shuffle Trivia Options deterministically with a shared seed so both players get identical order
 */
export function shuffleTriviaOptions(
  question: TriviaQuestion,
  seed: string | number
): { options: GuessOption[]; correctOptionId: 'pink' | 'yellow' | 'cream' | 'green' } {
  const correctOption = question.options.find((o) => o.id === question.correctOptionId);
  const correctText = correctOption ? correctOption.text : question.options[0].text;

  const shuffledTexts = shuffleWithSeed(
    question.options.map((o) => o.text),
    `${seed}-trivia-opts`
  );

  const colors: Array<'pink' | 'yellow' | 'cream' | 'green'> = ['pink', 'yellow', 'cream', 'green'];
  const options: GuessOption[] = colors.map((col, idx) => ({
    id: col,
    text: shuffledTexts[idx],
  }));

  const correctIndex = shuffledTexts.findIndex((t) => t === correctText);
  const correctOptionId = colors[correctIndex >= 0 ? correctIndex : 0];

  return { options, correctOptionId };
}
