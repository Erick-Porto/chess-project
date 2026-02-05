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

  private isMoveLegal(from: Position, to: Position): boolean {
    const tempBoard = this.board.clone();
    const piece = tempBoard.getPiece(from);
    if (!piece) return false;

    const capturedPiece = tempBoard.getPiece(to);
    tempBoard.removePiece(from);
    tempBoard.placePiece(piece, to);
    const kingPosition = tempBoard.findKingPosition(piece.color);
    const opponentColor = piece.color === Color.WHITE ? Color.BLACK : Color.WHITE;
    const isInCheck = tempBoard.isPositionUnderAttack(kingPosition, opponentColor);
    return !isInCheck;
  }

  getLegalMoves(position: Position): Position[] {
    const piece = this.board.getPiece(position);
    if (!piece || piece.color !== this.currentTurn) {
      return [];
    }
    const possibleMoves = piece.getPossibleMoves(this.board, position);
    return possibleMoves.filter((move) => this.isMoveLegal(position, move));
  }

  public makeMove(from: Position, to: Position): void {
    const piece = this.board.getPiece(from);
    if (!piece) {
      throw new InvalidMoveError('No piece at the source position.');
    }

    if (piece.color !== this.currentTurn) {
      throw new NotYourTurnError('It is not your turn to move.');
    }

    const possibleMoves = piece.getPossibleMoves(this.board, from);
    const isValidMove = possibleMoves.some((pos) => pos.row === to.row && pos.col === to.col);
    if (!isValidMove) {
      throw new InvalidMoveError('The move is not valid for the selected piece.');
    }

    const tempBoard = this.board.clone();
    tempBoard.removePiece(from);
    tempBoard.placePiece(piece, to);
    const kingPosition = tempBoard.findKingPosition(piece.color);
    const opponentColor = piece.color === Color.WHITE ? Color.BLACK : Color.WHITE;
    const isInCheck = tempBoard.isPositionUnderAttack(kingPosition, opponentColor);
    if (isInCheck) {
      throw new InvalidMoveError('You cannot make a move that puts or leaves your king in check.');
    } else {
      this.board.removePiece(from);
      this.board.placePiece(piece, to);
      this.moveHistory.push({
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
      });
      this.switchTurn();
    }
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

  checkGameOver(): {isGameOver: boolean, winner?: Color | 'draw' } {
    if(!this.hasAnyLegalMoves(this.currentTurn)) {
      if(this.isKingInCheck(this.currentTurn)) {
        return {isGameOver: true, winner: this.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE};
      }
      else{
        return {isGameOver: true, winner: 'draw'};
      }
    }
    return {isGameOver: false};
  }

  isKingInCheck(color: Color): boolean {
    // 1. Encontra o rei (ajuste para findKingPosition se for o nome no seu Board)
    const kingPos = this.board.findKingPosition(color); 
    const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

    // 2. Varre todas as casas para ver se algum inimigo ataca o rei
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pos = new Position(r, c);
        const piece = this.board.getPiece(pos);

        // Se for inimigo
        if (piece && piece.color === opponentColor) {
          const moves = piece.getPossibleMoves(this.board, pos);
          // Se um dos movimentos do inimigo cai em cima do Rei
          if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private hasAnyLegalMoves(color: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pos = new Position(row, col);
        const piece = this.board.getPiece(pos);
        
        if (piece && piece.color === color) {
          const moves = this.getLegalMoves(pos);
          
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
