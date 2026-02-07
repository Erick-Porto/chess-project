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
    const knightDirections = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ];

    for (const move of knightDirections) {
      const newRow = current.row + move.row;
      const newCol = current.col + move.col;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const nextPos = new Position(newRow, newCol);
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
