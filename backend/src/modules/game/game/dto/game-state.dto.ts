export interface GameState {
  board: any;
  turn: string;
  isGameOver: boolean;
  winner?: string | 'draw';
  lastMove?: { from: any; to: any };
  history: any[];
}
