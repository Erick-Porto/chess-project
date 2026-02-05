import { Board } from './board';
import { Position } from './position';
import { Color, Piece } from './piece';
import { Pawn } from '../pieces/pawn';
import { Rook } from '../pieces/rock';
import { Knight } from '../pieces/knight';
import { King } from '../pieces/king';
import { Queen } from '../pieces/queen';
import { Bishop } from '../pieces/bishop';

export interface MoveRecord {
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export class InvalidMoveError extends Error {}
export class NotYourTurnError extends Error {}

export class ChessGame {
  private readonly board: Board;
  private currentTurn: Color;
  private status: 'active' | 'checkmate' | 'draw';
  private moveHistory: MoveRecord[] = [];

  constructor() {
    this.board = new Board();
    this.currentTurn = Color.WHITE;
    this.status = 'active';
    this.initializeBoard();
  }

  private initializeBoard(): void {
    // Place pawns
    for (let col = 0; col < 8; col++) {
      this.board.placePiece(new Pawn(Color.WHITE), new Position(6, col));
      this.board.placePiece(new Pawn(Color.BLACK), new Position(1, col));
    }

    this.board.placePiece(new Rook(Color.WHITE), new Position(7, 0));
    this.board.placePiece(new Rook(Color.WHITE), new Position(7, 7));
    this.board.placePiece(new Rook(Color.BLACK), new Position(0, 0));
    this.board.placePiece(new Rook(Color.BLACK), new Position(0, 7));

    this.board.placePiece(new Knight(Color.WHITE), new Position(7, 1));
    this.board.placePiece(new Knight(Color.WHITE), new Position(7, 6));
    this.board.placePiece(new Knight(Color.BLACK), new Position(0, 1));
    this.board.placePiece(new Knight(Color.BLACK), new Position(0, 6));

    this.board.placePiece(new King(Color.WHITE), new Position(7, 4));
    this.board.placePiece(new King(Color.BLACK), new Position(0, 4));

    this.board.placePiece(new Queen(Color.WHITE), new Position(7, 3));
    this.board.placePiece(new Queen(Color.BLACK), new Position(0, 3));

    this.board.placePiece(new Bishop(Color.WHITE), new Position(7, 2));
    this.board.placePiece(new Bishop(Color.WHITE), new Position(7, 5));
    this.board.placePiece(new Bishop(Color.BLACK), new Position(0, 2));
    this.board.placePiece(new Bishop(Color.BLACK), new Position(0, 5));
  }

  public makeMove(from: Position, to: Position): void {
    if (this.status !== 'active') {
      throw new InvalidMoveError('Game is not active.');
    }

    const piece: Piece | null = this.board.getPiece(from);
    if (!piece) {
      throw new InvalidMoveError(
        `No piece at the source position. [${from.row}, ${from.col}]`,
      );
    }

    if (piece.color !== this.currentTurn) {
      throw new NotYourTurnError(`It's not ${piece.color}'s turn.`);
    }

    const possibleMoves = piece.getPossibleMoves(this.board, from);

    const isMovePossible = possibleMoves.some(
      (move) => move.row === to.row && move.col === to.col,
    );

    if (!isMovePossible) {
      throw new InvalidMoveError(
        `The move is not valid for the ${piece.type} piece.`,
      );
    }

    this.board.removePiece(from);
    this.board.placePiece(piece, to);

    this.moveHistory.push({
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
    });

    this.switchTurn();
  }

  private switchTurn(): void {
    this.currentTurn =
      this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
  }

  public getBoard(): Board {
    return this.board;
  }

  public getTurn(): Color {
    return this.currentTurn;
  }

  public getHistory(): MoveRecord[] {
    return this.moveHistory;
  }

  public static restore(history: MoveRecord[]): ChessGame {
    const game = new ChessGame();

    history.forEach((move) => {
      const from = new Position(move.from.row, move.from.col);
      const to = new Position(move.to.row, move.to.col);
      game.makeMove(from, to);
    });

    return game;
  }
}
