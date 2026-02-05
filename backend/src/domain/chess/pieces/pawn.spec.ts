import { Board } from '../core/board';
import { Color } from '../core/piece';
import { Position } from '../core/position';
import { Pawn } from './pawn';

describe('Pawn', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('White Pawn', () => {
    it('You must move one space forward if it is available.', () => {
      const whitePawn = new Pawn(Color.WHITE);
      const startPos = new Position(6, 4);
      board.placePiece(whitePawn, startPos);

      const moves = whitePawn.getPossibleMoves(board, startPos);

      const hasMove = moves.some((m) => m.row === 5 && m.col === 4);
      expect(hasMove).toBe(true);
    });

    it('It should allow you to move two pieces forward if it is your first move.', () => {
      const whitePawn = new Pawn(Color.WHITE);
      const startPos = new Position(6, 4);
      board.placePiece(whitePawn, startPos);

      const moves = whitePawn.getPossibleMoves(board, startPos);

      const hasSingleStep = moves.some((m) => m.row === 5 && m.col === 4);
      const hasDoubleStep = moves.some((m) => m.row === 4 && m.col === 4);

      expect(hasSingleStep).toBe(true);
      expect(hasDoubleStep).toBe(true);
    });

    it('You cannot move forward if blocked.', () => {
      const whitePawn = new Pawn(Color.WHITE);
      const startPos = new Position(6, 4);
      board.placePiece(whitePawn, startPos);

      const obstacle = new Pawn(Color.BLACK);
      const obstaclePos = new Position(5, 4);
      board.placePiece(obstacle, obstaclePos);

      const moves = whitePawn.getPossibleMoves(board, startPos);

      expect(moves.length).toBe(0);
    });
  });

  describe('Black Pawn', () => {
    it('You must move one space forward if it is available.', () => {
      const blackPawn = new Pawn(Color.BLACK);
      const startPos = new Position(1, 4);
      board.placePiece(blackPawn, startPos);

      const moves = blackPawn.getPossibleMoves(board, startPos);

      const hasMove = moves.some((m) => m.row === 2 && m.col === 4);
      expect(hasMove).toBe(true);
    });
  });
});
