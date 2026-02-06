export enum Color {
  WHITE = 'white',
  BLACK = 'black',
}

export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king',
}

export interface Piece {
  color: Color;
  type: PieceType;
}

export interface BoardState {
  grid: (Piece | null)[][];
}

export interface GameState {
  board: (Piece | null)[][];
  turn: Color;
  isGameOver?: boolean;
  winner?: string | null;
  history?: MoveRecord[];
}

export interface MoveRecord {
  from: { row: number; col: number };
  to: { row: number; col: number };
}
