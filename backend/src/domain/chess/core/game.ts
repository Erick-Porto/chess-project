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
  notation: string;
  promotion?: PieceType;
}

export class InvalidMoveError extends Error {}
export class NotYourTurnError extends Error {}

export class ChessGame {
  private readonly board: Board;
  private currentTurn: Color;
  private moveHistory: MoveRecord[] = [];
  private enPassantTarget: Position | null = null;
  private lastMove: { from: Position; to: Position } | null = null;
  private _winner: Color | 'draw' | null = null;
  private _isGameOver: boolean = false;

  constructor() {
    this.board = new Board();
    this.currentTurn = Color.WHITE;
    this.initializeBoard();
  }

  private initializeBoard(): void {
    for (let col = 0; col < 8; col++) {
      this.board.placePiece(new Pawn(Color.WHITE), new Position(6, col));
      this.board.placePiece(new Pawn(Color.BLACK), new Position(1, col));
    }
    const pieces = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
    pieces.forEach((PieceClass, col) => {
      this.board.placePiece(new PieceClass(Color.BLACK), new Position(0, col));
      this.board.placePiece(new PieceClass(Color.WHITE), new Position(7, col));
    });
  }

  public isKingInCheck(color: Color): boolean {
    const kingPosition = this.board.findKing(color);
    const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pos = new Position(row, col);
        const piece = this.board.getPiece(pos);

        if (piece && piece.color === opponentColor) {
          const moves = piece.getPossibleMoves(
            this.board,
            pos,
            this.enPassantTarget,
          );
          if (
            moves.some(
              (move) =>
                move.row === kingPosition.row && move.col === kingPosition.col,
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private isLegalMove(from: Position, to: Position): boolean {
    const piece = this.board.getPiece(from);
    if (!piece) return false;

    const capturedPiece: Piece | null = this.board.getPiece(to);
    this.board.movePiece(from, to);
    const isSafe = !this.isKingInCheck(piece.color);
    this.board.movePiece(to, from);
    if (capturedPiece) this.board.placePiece(capturedPiece, to);

    return isSafe;
  }

  public getLegalMoves(position: Position): Position[] {
    const piece = this.board.getPiece(position);
    if (!piece || piece.color !== this.currentTurn) return [];

    const possibleMoves = piece.getPossibleMoves(
      this.board,
      position,
      this.enPassantTarget,
    );
    return possibleMoves.filter((move) => this.isLegalMove(position, move));
  }

  public makeMove(from: Position, to: Position, promotion?: PieceType): void {
    const piece = this.board.getPiece(from);
    if (!piece) throw new InvalidMoveError('No piece at source.');
    if (piece.color !== this.currentTurn)
      throw new NotYourTurnError('Not your turn.');

    const possibleMoves = piece.getPossibleMoves(
      this.board,
      from,
      this.enPassantTarget,
    );
    const isPossible = possibleMoves.some(
      (p) => p.row === to.row && p.col === to.col,
    );

    if (!isPossible) throw new InvalidMoveError('Invalid move geometry.');
    if (!this.isLegalMove(from, to))
      throw new InvalidMoveError('King in check.');

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

    if (piece.type === PieceType.KING && Math.abs(to.col - from.col) === 2) {
      const isKingside = to.col > from.col;
      const rookFrom = new Position(from.row, isKingside ? 7 : 0);
      const rookTo = new Position(from.row, isKingside ? 5 : 3);
      this.board.movePiece(rookFrom, rookTo);
    }

    this.board.movePiece(from, to);
    if (isEnPassantCapture) {
      this.board.removePiece(new Position(from.row, to.col));
    }

    piece.markAsMoved();

    let promotionUsed: PieceType | undefined = undefined;
    if (piece.type === PieceType.PAWN && (to.row === 0 || to.row === 7)) {
      const newType = promotion || PieceType.QUEEN;
      promotionUsed = newType;
      const PieceClass =
        newType === PieceType.ROOK
          ? Rook
          : newType === PieceType.KNIGHT
            ? Knight
            : newType === PieceType.BISHOP
              ? Bishop
              : Queen;
      this.board.placePiece(new PieceClass(piece.color), to);
    }

    const notation = `${from.toNotation()}->${to.toNotation()}`;
    this.enPassantTarget = newEnPassantTarget;
    this.lastMove = { from, to };
    this.moveHistory.push({
      from: { ...from },
      to: { ...to },
      notation,
      promotion: promotionUsed,
    });
    this.switchTurn();
    this.updateGameStatus();
  }

  private switchTurn(): void {
    this.currentTurn =
      this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
  }

  private updateGameStatus() {
    if (!this.hasAnyLegalMoves(this.currentTurn)) {
      this._isGameOver = true;
      this._winner = this.isKingInCheck(this.currentTurn)
        ? this.currentTurn === Color.WHITE
          ? Color.BLACK
          : Color.WHITE
        : 'draw';
    } else {
      this._isGameOver = false;
      this._winner = null;
    }
  }

  private hasAnyLegalMoves(color: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board.getPiece(new Position(row, col));
        if (
          piece &&
          piece.color === color &&
          this.getLegalMoves(new Position(row, col)).length > 0
        )
          return true;
      }
    }
    return false;
  }

  public checkGameOver() {
    return { isGameOver: this._isGameOver, winner: this._winner };
  }
  public isGameOver() {
    return this._isGameOver;
  }
  public getWinner() {
    return this._winner;
  }
  public getLastMove() {
    return this.lastMove;
  }
  public getBoard() {
    return this.board;
  }
  public getTurn() {
    return this.currentTurn;
  }
  public getMoveHistory() {
    return this.moveHistory;
  }
  public getHistory() {
    return this.moveHistory;
  }

  public static restore(history: MoveRecord[]): ChessGame {
    const game = new ChessGame();
    history.forEach((move) => {
      game.makeMove(
        new Position(move.from.row, move.from.col),
        new Position(move.to.row, move.to.col),
        move.promotion,
      );
    });
    return game;
  }
}
