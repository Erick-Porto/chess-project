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
    const kingDirections = [
      { row: -1, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: 1 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];

    for (const move of kingDirections) {
      const newRow = current.row + move.row;
      const newCol = current.col + move.col;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const target = new Position(newRow, newCol);
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
