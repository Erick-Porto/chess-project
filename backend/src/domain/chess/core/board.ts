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

  isPositionUnderAttack(position: Position, attackingColor: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.grid[row][col];
        if (piece && piece.color === attackingColor) {
          const possibleMoves = piece.getPossibleMoves(this, new Position(row, col));
          if (possibleMoves.some((pos) => pos.equals(position))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  findKingPosition(color: Color): Position {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.grid[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return new Position(row, col);
        }
      }
    }
    throw new Error(`King of color ${color} not found on the board.`);
  }

  clone(): Board {
    const newBoard = new Board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.grid[row][col];
        newBoard.grid[row][col] = piece;
      }
    }
    return newBoard;
  }
  }