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
import { GameService } from '../game.service';
import { Position } from 'src/domain/chess/core/position';

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
    const { roomId } = payload;

    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);

    const { color, game } = await this.gameService.createOrGetGame(
      roomId,
      client.id,
      payload.playerName,
    );

    console.log(`Cliente ${client.id} entrou na sala ${roomId} como ${color}`);

    // 2. Avisa EXCLUSIVAMENTE este cliente qual é a cor dele
    client.emit('playerColor', color);

    this.server.to(roomId).emit('gameState', {
      turn: game.getTurn(), // TODO: serialize turn
      board: game.getBoard(), // TODO: serialize board
    });
  }

  @SubscribeMessage('getValidMoves')
  async handleGetValidMoves(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; row: number; col: number },
  ) {
    const room = await this.gameService.getGame(payload.roomId);
    const piece = room
      .getBoard()
      .getPiece(new Position(payload.row, payload.col));

    if (!piece) {
      client.emit('validMoves', []);
      return;
    }

    const moves = room.getLegalMoves(
      new Position(payload.row, payload.col),
    );
    client.emit('validMoves', moves);
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      from: { row: number; col: number };
      to: { row: number; col: number };
    },
  ) {
    try {
      const playerColor = await this.gameService.getPlayerColor(
        payload.roomId,
        client.id,
      );

      if (!playerColor) {
        throw new Error('Player not part of the game');
      }

      const room = await this.gameService.getGame(payload.roomId);

      if (playerColor !== room.getTurn()) {
        throw new Error('Not your turn');
      }

      console.log(`Client ${client.id} making move in room: ${payload.roomId}`);
      const newState = await this.gameService.makeMove(
        payload.roomId,
        payload.from,
        payload.to,
      );

      this.server.to(payload.roomId).emit('gameState', newState);
    } catch (error) {
      console.error(error.message);
      client.emit('error', { message: error.message });
    }
  }
}
