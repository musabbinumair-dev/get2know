export interface GuessOption {
  id: 'pink' | 'yellow' | 'cream' | 'green';
  text: string;
}

export interface TriviaQuestion {
  id: string;
  type: 'trivia';
  category: string;
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
  question: string;
  questionLines?: string[];
  prompt: string;
  player1DefaultAnswer: string;
  player2Answer: string;
  guessOptions: GuessOption[];
  correctOptionId: 'pink' | 'yellow' | 'cream' | 'green';
}

export type GameQuestion = TriviaQuestion | KnowMeQuestion;

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 't1',
    type: 'trivia',
    category: 'Space',
    question: "Which planet has the most moons in our solar system?",
    questionLines: ["Which planet has", "the most moons in our", "solar system?"],
    options: [
      { id: 'pink', text: "Jupiter" },
      { id: 'yellow', text: "Saturn" },
      { id: 'cream', text: "Uranus" },
      { id: 'green', text: "Neptune" },
    ],
    correctOptionId: 'yellow', // Saturn has 146 confirmed moons
    explanation: "Saturn officially holds the record with over 140 moons!",
  },
  {
    id: 't2',
    type: 'trivia',
    category: 'Animals',
    question: "What color is a polar bear's skin under its fur?",
    questionLines: ["What color is a", "polar bear's skin", "under its fur?"],
    options: [
      { id: 'pink', text: "Pink" },
      { id: 'yellow', text: "White" },
      { id: 'cream', text: "Black" },
      { id: 'green', text: "Grey" },
    ],
    correctOptionId: 'cream',
    explanation: "Polar bear skin is black to absorb sunlight, while their fur is hollow and transparent!",
  },
  {
    id: 't3',
    type: 'trivia',
    category: 'Food',
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
    id: 't4',
    type: 'trivia',
    category: 'Science',
    question: "How many bones are in the adult human body?",
    questionLines: ["How many bones are", "in the adult human", "body?"],
    options: [
      { id: 'pink', text: "198" },
      { id: 'yellow', text: "214" },
      { id: 'cream', text: "206" },
      { id: 'green', text: "220" },
    ],
    correctOptionId: 'cream',
    explanation: "An adult human has exactly 206 bones; babies are born with about 300 that fuse over time.",
  },
  {
    id: 't5',
    type: 'trivia',
    category: 'Pop Culture',
    question: "What year was the very first Apple iPhone released?",
    questionLines: ["What year was the", "very first Apple iPhone", "released?"],
    options: [
      { id: 'pink', text: "2005" },
      { id: 'yellow', text: "2007" },
      { id: 'cream', text: "2008" },
      { id: 'green', text: "2009" },
    ],
    correctOptionId: 'yellow',
    explanation: "Steve Jobs unveiled the iPhone in January 2007, changing tech forever.",
  },
  {
    id: 't6',
    type: 'trivia',
    category: 'Nature',
    question: "Which fruit floats in water because 25% of its volume is air?",
    questionLines: ["Which fruit floats", "in water because 25%", "is air?"],
    options: [
      { id: 'pink', text: "Watermelon" },
      { id: 'yellow', text: "Apple" },
      { id: 'cream', text: "Banana" },
      { id: 'green', text: "Orange" },
    ],
    correctOptionId: 'yellow',
    explanation: "Apples bob in water because air makes up 25% of their volume!",
  },
  {
    id: 't7',
    type: 'trivia',
    category: 'Geography',
    question: "Which continent is home to the world's driest desert, the Atacama?",
    questionLines: ["Which continent is home", "to the driest desert,", "the Atacama?"],
    options: [
      { id: 'pink', text: "Africa" },
      { id: 'yellow', text: "South America" },
      { id: 'cream', text: "Australia" },
      { id: 'green', text: "Asia" },
    ],
    correctOptionId: 'yellow',
    explanation: "The Atacama Desert is located in northern Chile, South America.",
  },
  {
    id: 't8',
    type: 'trivia',
    category: 'Games',
    question: "How many dots total appear on a standard pair of dice?",
    questionLines: ["How many dots total", "appear on a pair of", "standard dice?"],
    options: [
      { id: 'pink', text: "36" },
      { id: 'yellow', text: "40" },
      { id: 'cream', text: "42" },
      { id: 'green', text: "48" },
    ],
    correctOptionId: 'cream',
    explanation: "Each die has 1+2+3+4+5+6 = 21 pips, so a pair has 42 pips total!",
  },
  {
    id: 't9',
    type: 'trivia',
    category: 'Animals',
    question: "What mammal has the highest known blood pressure in the animal kingdom?",
    questionLines: ["What mammal has", "the highest known", "blood pressure?"],
    options: [
      { id: 'pink', text: "Blue Whale" },
      { id: 'yellow', text: "Cheetah" },
      { id: 'cream', text: "Giraffe" },
      { id: 'green', text: "Elephant" },
    ],
    correctOptionId: 'cream',
    explanation: "Giraffes need twice human blood pressure to pump blood all the way up their 6-foot necks!",
  },
  {
    id: 't10',
    type: 'trivia',
    category: 'Music',
    question: "Which legendary artist is known as the 'King of Pop'?",
    questionLines: ["Which legendary", "artist is known as the", "'King of Pop'?"],
    options: [
      { id: 'pink', text: "Prince" },
      { id: 'yellow', text: "Michael Jackson" },
      { id: 'cream', text: "Elvis Presley" },
      { id: 'green', text: "Stevie Wonder" },
    ],
    correctOptionId: 'yellow',
    explanation: "Michael Jackson earned the title with his groundbreaking hits like Thriller and Billie Jean.",
  },
  {
    id: 't11',
    type: 'trivia',
    category: 'Language',
    question: "What is the only letter that does not appear in any US state name?",
    questionLines: ["What letter does not", "appear in any US", "state name?"],
    options: [
      { id: 'pink', text: "Q" },
      { id: 'yellow', text: "Z" },
      { id: 'cream', text: "X" },
      { id: 'green', text: "J" },
    ],
    correctOptionId: 'pink',
    explanation: "The letter Q is not in any of the 50 state names!",
  },
  {
    id: 't12',
    type: 'trivia',
    category: 'Ocean',
    question: "What marine animal has blue blood and three functioning hearts?",
    questionLines: ["What marine animal", "has blue blood and 3", "functioning hearts?"],
    options: [
      { id: 'pink', text: "Octopus" },
      { id: 'yellow', text: "Seahorse" },
      { id: 'cream', text: "Manta Ray" },
      { id: 'green', text: "Jellyfish" },
    ],
    correctOptionId: 'pink',
    explanation: "Octopuses use copper-rich hemocyanin, making their blood blue!",
  },
  {
    id: 't13',
    type: 'trivia',
    category: 'Food',
    question: "Which sweet treat was originally prescribed by doctors in the 1830s as medicine?",
    questionLines: ["Which sweet treat", "was sold as medicine", "in the 1830s?"],
    options: [
      { id: 'pink', text: "Cotton Candy" },
      { id: 'yellow', text: "Chocolate" },
      { id: 'cream', text: "Ketchup" },
      { id: 'green', text: "Licorice" },
    ],
    correctOptionId: 'cream',
    explanation: "Dr. John Cook Bennett promoted tomato ketchup as a cure for indigestion in 1834!",
  },
  {
    id: 't14',
    type: 'trivia',
    category: 'Art',
    question: "In which city can you view the original Mona Lisa painting?",
    questionLines: ["In which city can", "you view the original", "Mona Lisa?"],
    options: [
      { id: 'pink', text: "Rome" },
      { id: 'yellow', text: "Paris" },
      { id: 'cream', text: "Florence" },
      { id: 'green', text: "Madrid" },
    ],
    correctOptionId: 'yellow',
    explanation: "The Mona Lisa is permanently displayed at the Louvre Museum in Paris, France.",
  },
  {
    id: 't15',
    type: 'trivia',
    category: 'Science',
    question: "What is the hardest natural substance known on Earth?",
    questionLines: ["What is the hardest", "natural substance known", "on Earth?"],
    options: [
      { id: 'pink', text: "Titanium" },
      { id: 'yellow', text: "Diamond" },
      { id: 'cream', text: "Graphene" },
      { id: 'green', text: "Quartz" },
    ],
    correctOptionId: 'yellow',
    explanation: "Diamond rates 10 on the Mohs hardness scale.",
  },
];

export const KNOW_ME_QUESTIONS: KnowMeQuestion[] = [
  {
    id: 'k1',
    type: 'know-me',
    category: 'Food',
    question: "What’s the worst food you’ve ever tried?",
    questionLines: ["What’s the worst", "food you’ve ever", "tried?"],
    prompt: "What's the worst food you've ever tasted?",
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
    id: 'k2',
    type: 'know-me',
    category: 'Fears',
    question: "What’s a fear you’d never tell anyone?",
    questionLines: ["What’s a fear you’d", "never tell", "anyone?"],
    prompt: "What is a secret fear you have?",
    player1DefaultAnswer: "Escalators stopping suddenly.",
    player2Answer: "Deep open ocean.",
    guessOptions: [
      { id: 'pink', text: "Spiders in shoes" },
      { id: 'yellow', text: "Deep open ocean" },
      { id: 'cream', text: "Elevators" },
      { id: 'green', text: "Public speaking" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 'k3',
    type: 'know-me',
    category: 'Hot takes',
    question: "What’s a hill you’re willing to die on?",
    questionLines: ["What’s a hill you’re", "willing to die", "on?"],
    prompt: "Share your most controversial hot take!",
    player1DefaultAnswer: "Cereal is actually cold soup.",
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
    id: 'k4',
    type: 'know-me',
    category: 'Deep',
    question: "What advice has had the biggest impact on you?",
    questionLines: ["What advice has had", "the biggest impact", "on you?"],
    prompt: "What's the best advice you've ever received?",
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
    id: 'k5',
    type: 'know-me',
    category: 'Habits',
    question: "What’s your weirdest daily habit?",
    questionLines: ["What’s your weirdest", "daily habit", "ever?"],
    prompt: "What is something quirky you do every day?",
    player1DefaultAnswer: "Checking if door is locked 3 times.",
    player2Answer: "Smelling fresh coffee beans before brewing.",
    guessOptions: [
      { id: 'pink', text: "Double alarm checking" },
      { id: 'yellow', text: "Walking backwards upstairs" },
      { id: 'cream', text: "Smelling coffee beans" },
      { id: 'green', text: "Organizing by color" },
    ],
    correctOptionId: 'cream',
  },
  {
    id: 'k6',
    type: 'know-me',
    category: 'Dreams',
    question: "Where is your number one dream travel destination?",
    questionLines: ["Where is your number", "one dream travel", "destination?"],
    prompt: "If you could board a plane anywhere right now?",
    player1DefaultAnswer: "Kyoto, Japan in cherry blossom season.",
    player2Answer: "Northern lights in Norway.",
    guessOptions: [
      { id: 'pink', text: "Kyoto in spring" },
      { id: 'yellow', text: "Northern lights in Norway" },
      { id: 'cream', text: "Santorini sunsets" },
      { id: 'green', text: "New Zealand hiking" },
    ],
    correctOptionId: 'yellow',
  },
  {
    id: 'k7',
    type: 'know-me',
    category: 'Comfort',
    question: "What is your ultimate go-to comfort meal after a long day?",
    questionLines: ["What is your ultimate", "comfort meal after a", "long day?"],
    prompt: "What food instantly makes your day better?",
    player1DefaultAnswer: "Warm spicy ramen with a soft-boiled egg.",
    player2Answer: "Mac and cheese with crispy breadcrumbs.",
    guessOptions: [
      { id: 'pink', text: "Spicy ramen bowl" },
      { id: 'yellow', text: "Warm chocolate chip cookies" },
      { id: 'cream', text: "Loaded cheeseburger" },
      { id: 'green', text: "Mac and cheese" },
    ],
    correctOptionId: 'green',
  },
  {
    id: 'k8',
    type: 'know-me',
    category: 'Childhood',
    question: "What was your favorite cartoon or show growing up?",
    questionLines: ["What was your favorite", "cartoon growing", "up?"],
    prompt: "Which childhood show holds a special place in your heart?",
    player1DefaultAnswer: "Avatar: The Last Airbender.",
    player2Answer: "SpongeBob SquarePants.",
    guessOptions: [
      { id: 'pink', text: "SpongeBob SquarePants" },
      { id: 'yellow', text: "Pokemon" },
      { id: 'cream', text: "Phineas and Ferb" },
      { id: 'green', text: "The Last Airbender" },
    ],
    correctOptionId: 'pink',
  },
  {
    id: 'k9',
    type: 'know-me',
    category: 'Superpowers',
    question: "If you could pick one superpower, what would it be?",
    questionLines: ["If you could pick one", "superpower, what", "would it be?"],
    prompt: "Choose your dream superpower!",
    player1DefaultAnswer: "Time travel to see history.",
    player2Answer: "Teleportation to travel instantly.",
    guessOptions: [
      { id: 'pink', text: "Invisibility" },
      { id: 'yellow', text: "Time travel" },
      { id: 'cream', text: "Teleportation" },
      { id: 'green', text: "Flying" },
    ],
    correctOptionId: 'cream',
  },
  {
    id: 'k10',
    type: 'know-me',
    category: 'Guilty Pleasures',
    question: "What song or movie is your biggest guilty pleasure?",
    questionLines: ["What song is your", "biggest guilty", "pleasure?"],
    prompt: "What track do you belt out when nobody's watching?",
    player1DefaultAnswer: "Party in the U.S.A. by Miley Cyrus.",
    player2Answer: "Dancing Queen by ABBA.",
    guessOptions: [
      { id: 'pink', text: "Dancing Queen by ABBA" },
      { id: 'yellow', text: "Party in the U.S.A." },
      { id: 'cream', text: "Call Me Maybe" },
      { id: 'green', text: "Never Gonna Give You Up" },
    ],
    correctOptionId: 'pink',
  },
];
