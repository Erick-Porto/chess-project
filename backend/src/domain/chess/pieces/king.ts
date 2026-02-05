import { Piece, Color, PieceType } from '../core/piece';
import { Board } from '../core/board';
import { Position } from '../core/position';

export class King extends Piece {
  constructor(color: Color) {
    super(color, PieceType.KING);
  }

  getPossibleMoves(board: Board, currentPosition: Position): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      { row: -1, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: 1 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];
    for (const move of knightMoves) {
      const newRow = currentPosition.row + move.row;
      const newCol = currentPosition.col + move.col;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const newPos = new Position(newRow, newCol);
        if (
          board.isEmpty(newPos) ||
          board.isOccupiedByOpponent(newPos, this.color)
        ) {
          moves.push(newPos);
        }
      }
    }

    return moves;
  }
}
