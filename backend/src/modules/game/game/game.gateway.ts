import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Position } from 'src/domain/chess/core/position';
import { Color, PieceType } from 'src/domain/chess/core/piece';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; playerName: string },
  ) {
    const { roomId, playerName } = payload;
    client.join(roomId);

    await this.gameService.createOrGetGame(roomId);
    const gameDoc = await this.gameService.getGameDocument(roomId);
    const gameDomain = await this.gameService.getGame(roomId);

    if (!gameDoc) return;

    let color: Color | 'spectator' = 'spectator';

    if (gameDoc.whitePlayerName === playerName) {
      color = Color.WHITE;
    } else if (gameDoc.blackPlayerName === playerName) {
      color = Color.BLACK;
    } else if (!gameDoc.whitePlayerName) {
      gameDoc.whitePlayerName = playerName;
      color = Color.WHITE;
      await this.gameService.updateGame(roomId, {
        whitePlayerName: playerName,
      });
    } else if (!gameDoc.blackPlayerName) {
      gameDoc.blackPlayerName = playerName;
      color = Color.BLACK;
      await this.gameService.updateGame(roomId, {
        blackPlayerName: playerName,
      });
    }

    (client as any).data.color = color;
    client.emit('playerColor', color);

    this.server.to(roomId).emit('gameState', {
      board: gameDomain.getBoard().getGrid(),
      turn: gameDomain.getTurn(),
      isGameOver: gameDomain.isGameOver(),
      winner: gameDomain.getWinner(),
      history: gameDomain.getMoveHistory(),
      lastMove: gameDomain.getLastMove(),
      players: {
        white: gameDoc.whitePlayerName,
        black: gameDoc.blackPlayerName,
      },
    });
  }

  @SubscribeMessage('getValidMoves')
  async handleGetValidMoves(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; row: number; col: number },
  ) {
    try {
      const room = await this.gameService.getGame(payload.roomId);
      const moves = room.getLegalMoves(new Position(payload.row, payload.col));
      client.emit('validMoves', moves);
    } catch (error) {
      client.emit('validMoves', []);
    }
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      from: { row: number; col: number };
      to: { row: number; col: number };
      promotion?: string;
    },
  ) {
    try {
      const playerColor = (client as any).data.color as Color | undefined;

      if (!playerColor || playerColor === ('spectator' as any)) {
        throw new Error('Spectators cannot move pieces.');
      }

      const room = await this.gameService.getGame(payload.roomId);

      if (playerColor !== room.getTurn()) {
        throw new Error('Not your turn.');
      }

      const promotionType = payload.promotion as PieceType | undefined;
      const newState = await this.gameService.makeMove(
        payload.roomId,
        payload.from,
        payload.to,
        promotionType,
      );

      this.server.to(payload.roomId).emit('gameState', newState);
    } catch (error: any) {
      console.error(`[Move Error] ${error.message}`);
      client.emit('error', { message: error.message || 'Invalid move' });
    }
  }
}
