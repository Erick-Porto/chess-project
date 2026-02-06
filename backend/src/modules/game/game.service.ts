import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChessGame } from 'src/domain/chess/core/game';
import { Position } from 'src/domain/chess/core/position';
import { Color } from 'src/domain/chess/core/piece';
import { GameModel, GameDocument } from './game/schemas/game.schema';

@Injectable()
export class GameService {
  private activeGames: Map<string, ChessGame> = new Map();

  constructor(
    @InjectModel(GameModel.name) private gameModel: Model<GameDocument>,
  ) {}

  async createOrGetGame(
    roomId: string,
    socketId: string,
    playerName?: string,
  ): Promise<{ color: Color | 'spectator'; game: ChessGame }> {
    let gameDoc = await this.gameModel.findOne({ roomId }).exec();
    let gameDomain: ChessGame;

    if (!gameDoc) {
      console.log('[Mongo] creating new game room:', roomId);

      gameDoc = await this.gameModel.create({
        roomId,
        moves: [],
      });

      gameDomain = new ChessGame();
    } else {
      if (this.activeGames.has(roomId)) {
        gameDomain = this.activeGames.get(roomId)!;
      } else {
        console.log('[Mongo] loading existing game room:', roomId);
        gameDomain = ChessGame.restore(gameDoc.moves);
      }
    }

    this.activeGames.set(roomId, gameDomain);

    let assignedColor: Color | 'spectator' = 'spectator';
    let needsSave = false;

    if (!gameDoc.whiteSocketId && gameDoc.blackSocketId !== socketId) {
      gameDoc.whiteSocketId = socketId;
      gameDoc.whitePlayerName = playerName!;
      assignedColor = Color.WHITE;
      needsSave = true;
    } else if (!gameDoc.blackSocketId && gameDoc.whiteSocketId !== socketId) {
      gameDoc.blackSocketId = socketId;
      gameDoc.blackPlayerName = playerName!;
      assignedColor = Color.BLACK;
      needsSave = true;
    } else if (gameDoc.whiteSocketId === socketId) {
      assignedColor = Color.WHITE;
    } else if (gameDoc.blackSocketId === socketId) {
      assignedColor = Color.BLACK;
    }

    if (needsSave) {
      await gameDoc.save();
    }

    return { color: assignedColor, game: gameDomain };
  }

  async getPlayerColor(
    roomId: string,
    socketId: string,
  ): Promise<Color | null> {
    // Consulta rápida no Mongo para garantir segurança (podemos cachear se quiser)
    const doc = await this.gameModel
      .findOne({ roomId })
      .select('whiteSocketId blackSocketId')
      .exec();

    if (!doc) return null;
    if (doc.whiteSocketId === socketId) return Color.WHITE;
    if (doc.blackSocketId === socketId) return Color.BLACK;

    return null;
  }

  async getGame(roomId: string): Promise<ChessGame> {
    if (this.activeGames.has(roomId)) {
      return this.activeGames.get(roomId)!;
    }

    const doc = await this.gameModel.findOne({ roomId }).exec();

    if (!doc) {
      throw new Error(`Jogo não encontrado na sala: ${roomId}`);
    }

    const game = ChessGame.restore(doc.moves);
    this.activeGames.set(roomId, game);

    return game;
  }

  async makeMove(
    roomId: string,
    fromNotation: { row: number; col: number },
    toNotation: { row: number; col: number },
  ) {
    let game = this.activeGames.get(roomId);

    if (!game) {
      const result = await this.createOrGetGame(roomId, 'system-restore');
      game = result.game;
    }

    const from = new Position(fromNotation.row, fromNotation.col);
    const to = new Position(toNotation.row, toNotation.col);

    game.makeMove(from, to);

    const { isGameOver, winner } = game.checkGameOver();

    if (isGameOver) {
      this.activeGames.delete(roomId);
    }

    const gameDoc = await this.gameModel.findOne({ roomId }).exec();

    if (gameDoc) {
      gameDoc.moves = game.getHistory();

      await gameDoc.save();
    }

    return {
      board: game.getBoard().getGrid(),
      turn: game.getTurn(),
      isGameOver: isGameOver,
      winner: winner,
      history: game.getHistory(),
    };
  }
}
