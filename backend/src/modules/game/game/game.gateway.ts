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

  private activeSessions = new Map<string, Color | 'spectator'>();

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`[Connection] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Connection] Client disconnected: ${client.id}`);
    this.activeSessions.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; playerName: string },
  ) {
    const { roomId, playerName } = payload;

    const inputName = playerName ? playerName.trim().toLowerCase() : '';

    client.join(roomId);

    await this.gameService.createOrGetGame(roomId);

    const gameDoc = await this.gameService.getGameDocument(roomId);
    const gameDomain = await this.gameService.getGame(roomId);

    if (!gameDoc) return;

    const dbWhite = gameDoc.whitePlayerName
      ? gameDoc.whitePlayerName.trim().toLowerCase()
      : '';
    const dbBlack = gameDoc.blackPlayerName
      ? gameDoc.blackPlayerName.trim().toLowerCase()
      : '';

    console.log('--- JOIN DEBUG ---');
    console.log(`Sala: ${roomId}`);
    console.log(`Input Jogador: "${inputName}"`);
    console.log(`Banco White:   "${dbWhite}"`);
    console.log(`Banco Black:   "${dbBlack}"`);
    console.log('------------------');

    let color: Color | 'spectator' = 'spectator';

    if (dbWhite && dbWhite === inputName) {
      console.log(`✅ MATCH! ${playerName} reconhecido como WHITE (Reconexão)`);
      color = Color.WHITE;
      await this.gameService.updateGame(roomId, { whiteSocketId: client.id });
    }
    else if (dbBlack && dbBlack === inputName) {
      console.log(`✅ MATCH! ${playerName} reconhecido como BLACK (Reconexão)`);
      color = Color.BLACK;
      await this.gameService.updateGame(roomId, { blackSocketId: client.id });
    }
    else if (!dbWhite) {
      console.log(`🆕 Vaga White livre. Atribuindo a ${playerName}`);
      color = Color.WHITE;
      await this.gameService.updateGame(roomId, {
        whitePlayerName: payload.playerName, // Salva nome original
        whiteSocketId: client.id,
      });
    }
    else if (!dbBlack) {
      console.log(`🆕 Vaga Black livre. Atribuindo a ${playerName}`);
      color = Color.BLACK;
      await this.gameService.updateGame(roomId, {
        blackPlayerName: payload.playerName, // Salva nome original
        blackSocketId: client.id,
      });
    }
    else {
      console.log(
        `👁️ Sem vagas ou nome não bate. ${playerName} entrou como Espectador.`,
      );
    }

    this.activeSessions.set(client.id, color);

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
        white: gameDoc.whitePlayerName || '',
        black: gameDoc.blackPlayerName || '',
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
      let playerColor = this.activeSessions.get(client.id);

      if (!playerColor) {
        playerColor = (client as any).data.color;
      }

      console.log(`[Move Attempt] Socket: ${client.id} | Cor: ${playerColor}`);

      if (!playerColor || playerColor === 'spectator') {
        throw new Error(
          'Player not part of the game (Identified as Spectator)',
        );
      }

      const room = await this.gameService.getGame(payload.roomId);

      if (playerColor !== room.getTurn()) {
        throw new Error(`Não é sua vez. Aguarde o jogador ${room.getTurn()}.`);
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
      client.emit('error', { message: error.message || 'Erro no movimento' });
    }
  }
}
