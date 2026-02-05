import { Piece, Color, PieceType } from '../core/piece';
import { Board } from '../core/board';
import { Position } from '../core/position';

export class Bishop extends Piece {
  constructor(color: Color) {
    super(color, PieceType.BISHOP);
  }

  getPossibleMoves(board: Board, currentPosition: Position): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
    for (const move of knightMoves) {
      let newRow = currentPosition.row + move.row;
      let newCol = currentPosition.col + move.col;
      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const newPos = new Position(newRow, newCol);
        if (board.isEmpty(newPos)) {
          moves.push(newPos);
        } else {
          if (board.isOccupiedByOpponent(newPos, this.color)) {
            moves.push(newPos);
          }
          break;
        }
        newRow += move.row;
        newCol += move.col;
      }
    }

    return moves;
  }
}
