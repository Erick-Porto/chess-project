import { Position } from './position';
import { Board } from './board';

export enum Color {
  WHITE = 'white',
  BLACK = 'black',
}

export enum PieceType {
  PAWN = 'pawn',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  ROOK = 'rook',
  QUEEN = 'queen',
  KING = 'king',
}

export abstract class Piece {
  constructor(
    public readonly color: Color,
    public readonly type: PieceType,
  ) {}

  abstract getPossibleMoves(
    board: Board,
    currentPosition: Position,
  ): Position[];

  isOpponent(other: Piece): boolean {
    return this.color !== other.color;
  }
}
