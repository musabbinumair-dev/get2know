export interface HomeMockData {
  userName: string;
  friendName: string;
  streak: number;
  record: string;
  lastGame: {
    title: string;
    category: string;
    result: string;
    score: string;
  };
}

export const mockData: HomeMockData = {
  userName: 'Alex',
  friendName: 'Sam',
  streak: 12,
  record: '7 - 5',
  lastGame: {
    title: 'Last game',
    category: 'Trivia · Food',
    result: 'You won',
    score: '80 - 65',
  },
};
