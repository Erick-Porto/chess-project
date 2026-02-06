import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socketService } from 'src/services/socket.service';
import type { GameState, Piece, MoveRecord } from 'src/types/chess'; // Importe MoveRecord
import { Color } from 'src/types/chess';

export const useGameStore = defineStore('game', () => {
  // --- STATE ---
  const board = ref<(Piece | null)[][]>([]);
  const turn = ref<Color>(Color.WHITE);
  const roomId = ref<string>('');
  const isConnected = ref<boolean>(false);
  const errorMessage = ref<string>('');
  const myColor = ref<Color | 'spectator' | null>(null);

  const validMoves = ref<{ row: number; col: number }[]>([]);
  const selectedPosition = ref<{ row: number; col: number } | null>(null);

  // Novos estados tipados corretamente
  const winner = ref<string | null>(null);
  const isGameOver = ref<boolean>(false);
  const moveHistory = ref<MoveRecord[]>([]); // CORREÇÃO: Tipo explícito (sem any)

  // --- ACTIONS ---

  function fetchValidMoves(row: number, col: number) {
    if (!roomId.value) return;
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
      console.log('Received game state:', state);
      if (state.board) {
        board.value = state.board;
      }

      turn.value = state.turn;

      // Mapeamento dos novos campos (Opcionais no DTO, mas garantidos na lógica)
      winner.value = state.winner || null;
      isGameOver.value = state.isGameOver || false;

      if (state.history) {
        moveHistory.value = state.history;
      }

      // Se for a primeira conexão ou reconexão, limpa erros
      isConnected.value = true;
      errorMessage.value = '';
    });

    socketService.onValidMoves((moves) => {
      validMoves.value = moves;
    });

    socketService.onError((err) => {
      errorMessage.value = err.message;
      // Limpa mensagem após 5s para não poluir a UI
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

    // UX: Limpa seleção imediatamente para dar feedback visual rápido
    selectedPosition.value = null;
    clearValidMoves();
  }

  function disconnect() {
    // CORREÇÃO: Usa o método público, respeitando o encapsulamento
    socketService.disconnect();

    isConnected.value = false;
    board.value = [];
    moveHistory.value = [];
    roomId.value = '';
    myColor.value = null;
    winner.value = null;
    isGameOver.value = false;
  }

  return {
    board,
    turn,
    roomId,
    isConnected,
    errorMessage,
    myColor,
    validMoves,
    selectedPosition,
    winner,
    isGameOver,
    moveHistory,
    joinRoom,
    clearValidMoves,
    fetchValidMoves,
    makeMove,
    disconnect,
  };
});
