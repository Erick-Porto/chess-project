export interface GameState {
  board: any; // ou Piece[][]
  turn: string;
  isGameOver: boolean;
  winner?: string | 'draw'; // 'WHITE', 'BLACK' ou 'draw'
  lastMove?: { from: any; to: any }; // Opcional, para highlight
  history: any[]; // Vamos mandar o histórico
}
