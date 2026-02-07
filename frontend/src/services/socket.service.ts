import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { Color, GameState, PieceType } from 'src/types/chess';

class SocketService {
  private socket: Socket | null = null;
  private readonly URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  getValidMoves(roomId: string, row: number, col: number) {
    this.socket?.emit('getValidMoves', { roomId, row, col });
  }

  onValidMoves(callback: (moves: { row: number; col: number }[]) => void) {
    this.socket?.on('validMoves', callback);
  }

  onPlayerColor(callback: (color: Color | 'spectator') => void): void {
    this.socket?.on('playerColor', callback);
  }

  connect(roomId: string, playerName: string): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.socket = io(this.URL);

    this.socket.on('connect', () => {
      this.joinRoom(roomId, playerName);
    });
  }

  joinRoom(roomId: string, playerName: string): void {
    this.socket?.emit('joinRoom', { roomId, playerName });
  }

  move(
    roomId: string,
    from: { col: number; row: number },
    to: { col: number; row: number },
    promotion?: PieceType,
  ): void {
    this.socket?.emit('makeMove', { roomId, from, to, promotion });
  }

  onGameState(callback: (state: GameState) => void): void {
    this.socket?.on('gameState', callback);
  }

  onError(callback: (error: { message: string }) => void): void {
    this.socket?.on('error', callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
