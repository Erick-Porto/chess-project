import { ChessGame, InvalidMoveError, NotYourTurnError } from './game';
import { Position } from './position';
import { Color } from './piece';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  it('White Pawn First Moves', () => {
    expect(game.getTurn()).toBe(Color.WHITE);
  });

  it('White Pawns valid move', () => {
    const from = new Position(6, 4);
    const to = new Position(5, 4);

    game.makeMove(from, to);

    const pieceAtDestination = game.getBoard().getPiece(to);
    expect(pieceAtDestination).toBeDefined();
    expect(pieceAtDestination?.color).toBe(Color.WHITE);
    expect(game.getBoard().isEmpty(from)).toBe(true);
    expect(game.getTurn()).toBe(Color.BLACK);
  });

  it('Dont allow move if not your turn', () => {
    const from = new Position(1, 4);
    const to = new Position(2, 4);

    expect(() => {
      game.makeMove(from, to);
    }).toThrow(NotYourTurnError);
  });

  it('Invalid move', () => {
    const from = new Position(6, 4);
    const to = new Position(4, 0);

    expect(() => {
      game.makeMove(from, to);
    }).toThrow(InvalidMoveError);
  });
});
