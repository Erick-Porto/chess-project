import { Board } from './board';
import { Position } from './position';
import { Color, Piece, PieceType } from './piece';
import { Pawn } from '../pieces/pawn';
import { Rook } from '../pieces/rook';
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
  private moveHistory: MoveRecord[] = [];
  private enPassantTarget: Position | null = null;

  constructor() {
    this.board = new Board();
    this.currentTurn = Color.WHITE;
    this.initializeBoard();
  }

  private initializeBoard(): void {
    // Pawns
    for (let col = 0; col < 8; col++) {
      this.board.placePiece(new Pawn(Color.WHITE), new Position(6, col));
      this.board.placePiece(new Pawn(Color.BLACK), new Position(1, col));
    }

    // Rooks
    this.board.placePiece(new Rook(Color.WHITE), new Position(7, 0));
    this.board.placePiece(new Rook(Color.WHITE), new Position(7, 7));
    this.board.placePiece(new Rook(Color.BLACK), new Position(0, 0));
    this.board.placePiece(new Rook(Color.BLACK), new Position(0, 7));

    // Knights
    this.board.placePiece(new Knight(Color.WHITE), new Position(7, 1));
    this.board.placePiece(new Knight(Color.WHITE), new Position(7, 6));
    this.board.placePiece(new Knight(Color.BLACK), new Position(0, 1));
    this.board.placePiece(new Knight(Color.BLACK), new Position(0, 6));

    // Bishops
    this.board.placePiece(new Bishop(Color.WHITE), new Position(7, 2));
    this.board.placePiece(new Bishop(Color.WHITE), new Position(7, 5));
    this.board.placePiece(new Bishop(Color.BLACK), new Position(0, 2));
    this.board.placePiece(new Bishop(Color.BLACK), new Position(0, 5));

    // Queens
    this.board.placePiece(new Queen(Color.WHITE), new Position(7, 3));
    this.board.placePiece(new Queen(Color.BLACK), new Position(0, 3));

    // Kings
    this.board.placePiece(new King(Color.WHITE), new Position(7, 4));
    this.board.placePiece(new King(Color.BLACK), new Position(0, 4));
  }

  // --- LÓGICA CORE ---

  isKingInCheck(color: Color): boolean {
    const kingPos = this.board.findKing(color);
    const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pos = new Position(r, c);
        const piece = this.board.getPiece(pos);

        if (piece && piece.color === opponentColor) {
          const moves = piece.getPossibleMoves(
            this.board,
            pos,
            this.enPassantTarget,
          );
          if (
            moves.some((m) => m.row === kingPos.row && m.col === kingPos.col)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private isMoveLegal(from: Position, to: Position): boolean {
    const piece = this.board.getPiece(from);
    if (!piece) return false;

    const capturedPiece: Piece | null = this.board.getPiece(to);

    this.board.movePiece(from, to);

    const isSafe = !this.isKingInCheck(piece.color);

    this.board.movePiece(to, from);

    if (capturedPiece) {
      this.board.placePiece(capturedPiece, to);
    }

    return isSafe;
  }

  getLegalMoves(position: Position): Position[] {
    const piece = this.board.getPiece(position);
    if (!piece || piece.color !== this.currentTurn) return [];

    const possibleMoves = piece.getPossibleMoves(
      this.board,
      position,
      this.enPassantTarget,
    );
    return possibleMoves.filter((move) => this.isMoveLegal(position, move));
  }

  public makeMove(from: Position, to: Position): void {
    const piece = this.board.getPiece(from);
    if (!piece) throw new InvalidMoveError('No piece.');
    if (piece.color !== this.currentTurn)
      throw new NotYourTurnError('Not turn.');

    const possibleMoves = piece.getPossibleMoves(
      this.board,
      from,
      this.enPassantTarget,
    );
    const isPossible = possibleMoves.some(
      (p) => p.row === to.row && p.col === to.col,
    );
    if (!isPossible) throw new InvalidMoveError('Invalid move.');

    if (!this.isMoveLegal(from, to))
      throw new InvalidMoveError('King in Check.');

    let isEnPassantCapture = false;
    let newEnPassantTarget: Position | null = null;

    if (piece.type === PieceType.PAWN) {
      if (
        this.enPassantTarget &&
        to.row === this.enPassantTarget.row &&
        to.col === this.enPassantTarget.col
      ) {
        isEnPassantCapture = true;
      } else if (Math.abs(to.row - from.row) === 2) {
        newEnPassantTarget = new Position((from.row + to.row) / 2, from.col);
      }
    }

    this.board.movePiece(from, to);

    if (isEnPassantCapture) {
      const captureRow = piece.color === Color.WHITE ? to.row + 1 : to.row - 1;
      this.board.removePiece(new Position(captureRow, to.col));
    }

    piece.markAsMoved();

    if (piece.type === PieceType.PAWN) {
      if (
        (piece.color === Color.WHITE && to.row === 0) ||
        (piece.color === Color.BLACK && to.row === 7)
      ) {
        this.board.placePiece(new Queen(piece.color), to);
      }
    }

    this.enPassantTarget = newEnPassantTarget;

    this.moveHistory.push({ from: { ...from }, to: { ...to } });
    this.switchTurn();
  }

  private switchTurn(): void {
    this.currentTurn =
      this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
  }

  checkGameOver(): { isGameOver: boolean; winner?: Color | 'draw' } {
    if (!this.hasAnyLegalMoves(this.currentTurn)) {
      if (this.isKingInCheck(this.currentTurn)) {
        return {
          isGameOver: true,
          winner: this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE,
        };
      } else {
        return { isGameOver: true, winner: 'draw' };
      }
    }
    return { isGameOver: false };
  }

  private hasAnyLegalMoves(color: Color): boolean {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pos = new Position(r, c);
        const piece = this.board.getPiece(pos);

        if (piece && piece.color === color) {
          if (this.getLegalMoves(pos).length > 0) return true;
        }
      }
    }
    return false;
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
      game.makeMove(
        new Position(move.from.row, move.from.col),
        new Position(move.to.row, move.to.col),
      );
    });
    return game;
  }
}
