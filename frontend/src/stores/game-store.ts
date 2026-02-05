import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socketService } from 'src/services/socket.service';
import type { GameState, Piece } from 'src/types/chess';
import { Color } from 'src/types/chess';

export const useGameStore = defineStore('game', () => {
  const board = ref<(Piece | null)[][]>([]);
  const turn = ref<Color>(Color.WHITE);
  const roomId = ref<string>('');
  const isConnected = ref<boolean>(false);
  const errorMessage = ref<string>('');
  const myColor = ref<Color | 'spectator' | null>(null);
  const validMoves = ref<{ row: number; col: number }[]>([]);
  const selectedPosition = ref<{ row: number; col: number } | null>(null);

  function fetchValidMoves(row: number, col: number) {
    if (!roomId.value) return;
    // Usa o método público do service
    socketService.getValidMoves(roomId.value, row, col);
  }

  function clearValidMoves() {
    validMoves.value = [];
  }

  function joinRoom(room: string, playerName: string) {
    roomId.value = room;
    socketService.connect(room, playerName);

    socketService.onPlayerColor((color) => {
      console.log('Assigned color:', color);
      myColor.value = color;
    });

    socketService.onGameState((state: GameState) => {
      if (state.board && state.board.grid) {
        board.value = state.board.grid;
      }
      turn.value = state.turn;
      isConnected.value = true;
      errorMessage.value = '';
    });

    socketService.onValidMoves((moves) => {
      validMoves.value = moves;
    });

    socketService.onError((err) => {
      errorMessage.value = err.message;
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    });
  }
  function makeMove(from: { col: number; row: number }, to: { col: number; row: number }) {
    if (!roomId.value) {
      errorMessage.value = 'Not connected to any room.';
      return;
    }
    socketService.move(roomId.value, from, to);
    selectedPosition.value = null;
    clearValidMoves();
  }

  return {
    board,
    turn,
    roomId,
    isConnected,
    errorMessage,
    joinRoom,
    selectedPosition,
    clearValidMoves,
    fetchValidMoves,
    makeMove,
    myColor,
    validMoves,
  };
});
