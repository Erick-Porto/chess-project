import { Piece, Color } from './piece';
import { Position } from './position';

export class Board {
  private grid: (Piece | null)[][];

  constructor() {
    this.grid = this.createEmptyBoard();
  }

  private createEmptyBoard(): (Piece | null)[][] {
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  }

  placePiece(piece: Piece, position: Position): void {
    this.grid[position.row][position.col] = piece;
  }

  getPiece(position: Position): Piece | null {
    return this.grid[position.row][position.col];
  }

  removePiece(position: Position): Piece | null {
    const piece = this.grid[position.row][position.col];
    this.grid[position.row][position.col] = null;
    return piece;
  }

  isEmpty(position: Position): boolean {
    return this.getPiece(position) === null;
  }

  isOccupiedByOpponent(position: Position, color: Color): boolean {
    const piece = this.getPiece(position);
    return piece !== null && piece.color !== color;
  }
}
