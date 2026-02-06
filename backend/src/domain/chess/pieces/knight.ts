import { Piece, Color, PieceType } from '../core/piece';
import { Board } from '../core/board';
import { Position } from '../core/position';

export class Knight extends Piece {
  constructor(color: Color) {
    super(color, PieceType.KNIGHT);
  }

  getPossibleMoves(
    board: Board,
    current: Position,
    _enPassantTarget?: Position | null,
  ): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ];

    for (const move of knightMoves) {
      const nextRow = current.row + move.row;
      const nextCol = current.col + move.col;

      if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
        const nextPos = new Position(nextRow, nextCol);
        if (
          board.isEmpty(nextPos) ||
          board.isOccupiedByOpponent(nextPos, this.color)
        ) {
          moves.push(nextPos);
        }
      }
    }
    return moves;
  }
}
