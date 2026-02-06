import { Piece, Color, PieceType } from '../core/piece';
import { Board } from '../core/board';
import { Position } from '../core/position';

export class Pawn extends Piece {
  constructor(color: Color) {
    super(color, PieceType.PAWN);
  }

  getPossibleMoves(
    board: Board,
    current: Position,
    enPassantTarget?: Position | null,
  ): Position[] {
    const moves: Position[] = [];
    const direction = this.color === Color.WHITE ? -1 : 1;

    const forwardRow = current.row + direction;

    if (forwardRow >= 0 && forwardRow < 8) {
      const forwardPos = new Position(forwardRow, current.col);

      if (board.isEmpty(forwardPos)) {
        moves.push(forwardPos);

        const startRow = this.color === Color.WHITE ? 6 : 1;
        if (current.row === startRow) {
          const doubleStepRow = current.row + 2 * direction;
          if (doubleStepRow >= 0 && doubleStepRow < 8) {
            const doubleStepPos = new Position(doubleStepRow, current.col);
            if (board.isEmpty(doubleStepPos)) {
              moves.push(doubleStepPos);
            }
          }
        }
      }
    }

    if (forwardRow >= 0 && forwardRow < 8) {
      for (const colOffset of [-1, 1]) {
        const captureCol = current.col + colOffset;

        if (captureCol >= 0 && captureCol < 8) {
          const targetPos = new Position(forwardRow, captureCol);

          if (board.isOccupiedByOpponent(targetPos, this.color)) {
            moves.push(targetPos);
          }

          if (
            enPassantTarget &&
            targetPos.row === enPassantTarget.row &&
            targetPos.col === enPassantTarget.col
          ) {
            moves.push(targetPos);
          }
        }
      }
    }

    return moves;
  }
}
