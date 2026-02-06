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
    public hasMoved: boolean = false,
  ) {
    this.color = color;
    this.type = type;
    this.hasMoved = hasMoved;
  }

  abstract getPossibleMoves(
    board: Board,
    currentPosition: Position,
    enPassantTarget?: Position | null,
  ): Position[];

  isOpponent(other: Piece): boolean {
    return this.color !== other.color;
  }

  markAsMoved(): void {
    this.hasMoved = true;
  }
}
