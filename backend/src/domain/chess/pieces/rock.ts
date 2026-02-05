import { Piece, Color, PieceType } from '../core/piece';
import { Board } from '../core/board';
import { Position } from '../core/position';

export class Rook extends Piece {
  constructor(color: Color) {
    super(color, PieceType.ROOK);
  }

  getPossibleMoves(board: Board, current: Position): Position[] {
    const moves: Position[] = [];
    const rookDirections = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    for (const move of rookDirections) {
      let nextRow = current.row + move.row;
      let nextCol = current.col + move.col;

      while (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
        const nextPos = new Position(nextRow, nextCol);

        if (board.isEmpty(nextPos)) {
          moves.push(nextPos);
        } else {
          if (board.isOccupiedByOpponent(nextPos, this.color)) {
            moves.push(nextPos);
          }

          break;
        }

        nextRow += move.row;
        nextCol += move.col;
      }
    }

    return moves;
  }
}
