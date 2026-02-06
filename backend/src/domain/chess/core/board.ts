import { Piece, Color, PieceType } from './piece';
import { Position } from './position';

export class Board {
  private grid: (Piece | null)[][];

  constructor() {
    this.grid = this.createEmptyBoard();
  }

  private createEmptyBoard(): (Piece | null)[][] {
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  }

  public getGrid(): (Piece | null)[][] {
    return this.grid;
  }

  placePiece(piece: Piece, position: Position): void {
    this.grid[position.row][position.col] = piece;
  }

  etPiece(pos: Position): Piece | null {
    if (!this.isValidPosition(pos)) return null;
    return this.grid[pos.row][pos.col];
  }

  isEmpty(position: Position): boolean {
    return this.getPiece(position) === null;
  }

  isOccupiedByOpponent(position: Position, color: Color): boolean {
    const piece = this.getPiece(position);
    return piece !== null && piece.color !== color;
  }

  getPiece(pos: Position): Piece | null {
    if (!this.isValidPosition(pos)) return null;
    return this.grid[pos.row][pos.col];
  }

  isPositionUnderAttack(position: Position, attackingColor: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.grid[row][col];
        if (piece && piece.color === attackingColor) {
          const possibleMoves = piece.getPossibleMoves(
            this,
            new Position(row, col),
          );
          if (possibleMoves.some((pos) => pos.equals(position))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  movePiece(from: Position, to: Position): void {
    const piece = this.grid[from.row][from.col];

    // Só move se tiver peça (segurança interna)
    if (piece) {
      this.grid[from.row][from.col] = null; // Remove da origem
      this.grid[to.row][to.col] = piece; // Coloca no destino (Captura implícita)
    }
  }

  findKing(color: Color): Position {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.grid[r][c];
        if (piece && piece.type === PieceType.KING && piece.color === color) {
          return new Position(r, c);
        }
      }
    }
    throw new Error(`Rei ${color} sumiu do tabuleiro! Erro crítico.`);
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

  removePiece(position: Position): void {
    if (this.isValidPosition(position)) {
      this.grid[position.row][position.col] = null;
    }
  }

  private isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  }
}
