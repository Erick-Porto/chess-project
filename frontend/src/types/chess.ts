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
  board: BoardState;
  turn: Color;
}
