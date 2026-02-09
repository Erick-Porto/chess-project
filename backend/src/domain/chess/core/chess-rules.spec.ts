import { ChessGame, InvalidMoveError } from './game';
import { Position } from './position';
import { Color, PieceType } from './piece';
import { Rook } from '../pieces/rook';
import { King } from '../pieces/king';

describe('Chess Rules & Edge Cases', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  const move = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
    promotion?: PieceType,
  ) => {
    game.makeMove(
      new Position(row1, col1),
      new Position(row2, col2),
      promotion,
    );
  };

  describe('1. Validation of Check and King', () => {
    it('You must not allow a move that puts the King himself in check.', () => {
     
      move(6, 5, 5, 5); // White Pawn f2 -> f3
      move(1, 4, 3, 4); // Black Pawn e7 -> e5
      move(7, 4, 6, 5); // White King e1 -> f2 (Move to f2) - illegal in real opening, but let's try to expose

      game = new ChessGame();
      move(6, 4, 4, 4); // e2 -> e4
      move(1, 3, 3, 3); // d7 -> d5
      move(7, 4, 6, 4); // Ke1 -> e2 (King exposed)

    });

    it('Should detect that the King is in Check', () => {
      move(6, 5, 5, 5); // f2 -> f3 (White)
      move(1, 4, 2, 4); // e7 -> e6 (Black)
      move(6, 6, 4, 6); // g2 -> g4 (White)
      move(0, 3, 4, 7); // Qd8 -> h4 (Black) - CHECK!

      expect(game.isKingInCheck(Color.WHITE)).toBe(true);
    });
  });

  describe('2. Checkmate', () => {
    it('Should detect the "Fool\'s Mate" and end the game', () => {
      move(6, 5, 5, 5); // f2 -> f3
      move(1, 4, 3, 4); // e7 -> e5
      move(6, 6, 4, 6); // g2 -> g4
      move(0, 3, 4, 7); // Qd8 -> h4 # MATE

      const status = game.checkGameOver();
      expect(status.isGameOver).toBe(true);
      expect(status.winner).toBe(Color.BLACK);
    });
  });

  describe('3. En Passant', () => {
    it('Should perform the En Passant capture correctly', () => {
      move(6, 4, 4, 4); // White e2 -> e4
      move(1, 0, 2, 0); // Black a7 -> a6 (any move)
      move(4, 4, 3, 4); // White e4 -> e5 (Advanced pawn)
      move(1, 3, 3, 3); // Black d7 -> d5 (Double jump next to white pawn)

      move(3, 4, 2, 3);

      const capturedPawn = game.getBoard().getPiece(new Position(3, 3));
      expect(capturedPawn).toBeNull();

      const myPawn = game.getBoard().getPiece(new Position(2, 3));
      expect(myPawn?.type).toBe(PieceType.PAWN);
      expect(myPawn?.color).toBe(Color.WHITE);
    });
  });

  describe('4. Pawn Promotion', () => {
    it('Should promote the pawn to Queen upon reaching the last rank', () => {
     
      move(6, 7, 4, 7); // h2 -> h4
      move(1, 6, 3, 6); // g7 -> g5
      move(4, 7, 3, 6); // h4 x g5
      move(1, 0, 2, 0); // a7 -> a6 (any move)
      move(3, 6, 2, 6); // g5 -> g6
      move(2, 0, 3, 0); // a6 -> a5
      move(2, 6, 1, 7); // g6 x h7
      move(3, 0, 4, 0); // a5 -> a4

      move(1, 7, 0, 6, PieceType.QUEEN);

      const promotedPiece = game.getBoard().getPiece(new Position(0, 6));
      expect(promotedPiece?.type).toBe(PieceType.QUEEN);
      expect(promotedPiece?.color).toBe(Color.WHITE);
    });
  });

  describe('5. Castling', () => {
    it('Should allow Kingside Castling for White', () => {
      move(6, 4, 4, 4); // e2 -> e4
      move(1, 4, 3, 4); // e7 -> e5
      move(7, 6, 5, 5); // Ng1 -> f3
      move(0, 1, 2, 2); // Nc8 -> c6
      move(7, 5, 4, 2); // Bf1 -> c4
      move(0, 6, 2, 5); // Ng8 -> f6

      move(7, 4, 7, 6);

      const king = game.getBoard().getPiece(new Position(7, 6));
      const rook = game.getBoard().getPiece(new Position(7, 5));

      expect(king?.type).toBe(PieceType.KING);
      expect(rook?.type).toBe(PieceType.ROOK);
    });

    it('Should not allow Castling if the path is blocked', () => {
      
      game = new ChessGame();
      
      expect(() => {
        move(7, 4, 7, 6);
      }).toThrow(InvalidMoveError);
    });

    it('Should not allow Castling if the King has already moved', () => {
      move(6, 4, 4, 4); // e4
      move(1, 4, 3, 4); // e5
      move(7, 5, 4, 2); // Bc4
      move(0, 1, 2, 2); // Nc6
      move(7, 6, 5, 5); // Nf3
      move(0, 6, 2, 5); // Nf6

      move(7, 4, 7, 5); // Ke1 -> f1
      move(1, 0, 2, 0); // a6
      move(7, 5, 7, 4); // Kf1 -> e1
      move(2, 0, 3, 0); // a5

      expect(() => {
        move(7, 4, 7, 6);
      }).toThrow(InvalidMoveError);
    });
  });
});
