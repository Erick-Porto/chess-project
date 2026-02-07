import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChessGame } from 'src/domain/chess/core/game';
import { Position } from 'src/domain/chess/core/position';
import { PieceType } from 'src/domain/chess/core/piece';
import { GameModel, GameDocument } from './schemas/game.schema';

interface MoveSchema {
  from: { row: number; col: number };
  to: { row: number; col: number };
  notation?: string;
  promotion?: string;
}

@Injectable()
export class GameService {
  private activeGames: Map<string, ChessGame> = new Map();

  constructor(
    @InjectModel(GameModel.name) private gameModel: Model<GameDocument>,
  ) {}

  async createOrGetGame(roomId: string): Promise<{ game: ChessGame }> {
    let gameDoc = await this.gameModel.findOne({ roomId }).exec();
    let gameDomain: ChessGame;

    // LÓGICA DE LIMPEZA: Se o jogo já acabou, arquiva e cria um novo
    if (gameDoc && gameDoc.winner) {
      console.log(
        `[GameService] Sala ${roomId} finalizada encontrada. Arquivando...`,
      );

      gameDoc.roomId = `${roomId}_finished_${Date.now()}`;
      await gameDoc.save();

      this.activeGames.delete(roomId);

      gameDoc = null;
    }

    if (!gameDoc) {
      console.log(`[GameService] Criando nova sala: ${roomId}`);
      // CORREÇÃO ANTERIOR MANTIDA: 'winner' removido para ser undefined
      gameDoc = await this.gameModel.create({
        roomId,
        moves: [],
      });
      gameDomain = new ChessGame();
    } else {
      if (this.activeGames.has(roomId)) {
        gameDomain = this.activeGames.get(roomId)!;
      } else {
        gameDomain = ChessGame.restore(
          gameDoc.moves.map((m) => {
            const move = m as unknown as MoveSchema;
            return {
              from: move.from,
              to: move.to,
              notation: move.notation || '',
              promotion: move.promotion as PieceType | undefined,
            };
          }),
        );
      }
    }

    this.activeGames.set(roomId, gameDomain);
    return { game: gameDomain };
  }

  async getGameDocument(roomId: string) {
    return this.gameModel.findOne({ roomId }).exec();
  }

  async updateGame(
    roomId: string,
    updateData: Partial<GameModel>,
  ): Promise<void> {
    await this.gameModel.updateOne({ roomId }, updateData).exec();
  }

  async getGame(roomId: string): Promise<ChessGame> {
    if (this.activeGames.has(roomId)) {
      return this.activeGames.get(roomId)!;
    }
    const result = await this.createOrGetGame(roomId);
    return result.game;
  }

  async makeMove(
    roomId: string,
    fromNotation: { row: number; col: number },
    toNotation: { row: number; col: number },
    promotionType?: PieceType,
  ) {
    let game = this.activeGames.get(roomId);

    if (!game) {
      const result = await this.createOrGetGame(roomId);
      game = result.game;
    }

    const from = new Position(fromNotation.row, fromNotation.col);
    const to = new Position(toNotation.row, toNotation.col);

    game.makeMove(from, to, promotionType);
    const status = game.checkGameOver();

    const gameDoc = await this.gameModel.findOne({ roomId }).exec();
    if (gameDoc) {
      // CORREÇÃO AQUI: Cast explicito para satisfazer o Record<string, unknown>
      gameDoc.moves = game.getHistory() as unknown as Record<string, unknown>[];

      if (status.isGameOver) {
        console.log(
          `[GameService] Jogo em ${roomId} acabou. Vencedor: ${status.winner}`,
        );
        gameDoc.winner = status.winner || 'draw';
        this.activeGames.delete(roomId);
      }

      await gameDoc.save();
    }

    return {
      board: game.getBoard().getGrid(),
      turn: game.getTurn(),
      isGameOver: status.isGameOver,
      winner: status.winner,
      history: game.getHistory(),
      lastMove: game.getLastMove(),
    };
  }
}
