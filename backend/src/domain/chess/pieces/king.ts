// backend/src/domain/chess/pieces/king.ts
import { Piece, Color, PieceType } from '../core/piece';
import { Board } from '../core/board';
import { Position } from '../core/position';

export class King extends Piece {
  constructor(color: Color) {
    super(color, PieceType.KING);
  }

  getPossibleMoves(
    board: Board,
    current: Position,
    _enPassantTarget?: Position | null,
  ): Position[] {
    const moves: Position[] = [];
    const steps = [
      { row: -1, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: 1 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];

    for (const step of steps) {
      const nextRow = current.row + step.row;
      const nextCol = current.col + step.col;

      if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
        const target = new Position(nextRow, nextCol);
        if (
          board.isEmpty(target) ||
          board.isOccupiedByOpponent(target, this.color)
        ) {
          moves.push(target);
        }
      }
    }

    if (!this.hasMoved) {
      const row = this.color === Color.WHITE ? 7 : 0;

      if (
        board.isEmpty(new Position(row, 5)) &&
        board.isEmpty(new Position(row, 6))
      ) {
        const rook = board.getPiece(new Position(row, 7));
        if (
          rook &&
          rook.type === PieceType.ROOK &&
          rook.color === this.color &&
          !rook.hasMoved
        ) {
          moves.push(new Position(row, 6));
        }
      }

      if (
        board.isEmpty(new Position(row, 1)) &&
        board.isEmpty(new Position(row, 2)) &&
        board.isEmpty(new Position(row, 3))
      ) {
        const rook = board.getPiece(new Position(row, 0));
        if (
          rook &&
          rook.type === PieceType.ROOK &&
          rook.color === this.color &&
          !rook.hasMoved
        ) {
          moves.push(new Position(row, 2));
        }
      }
    }

    return moves;
  }
}
