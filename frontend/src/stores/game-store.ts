import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socketService } from 'src/services/socket.service';
import type { GameState, Piece, MoveRecord, PieceType } from 'src/types/chess';
import { Color } from 'src/types/chess';

export const useGameStore = defineStore('game', () => {
  const board = ref<(Piece | null)[][]>([]);
  const turn = ref<Color>(Color.WHITE);
  const roomId = ref<string>('');
  const isConnected = ref<boolean>(false);
  const errorMessage = ref<string>('');
  const myColor = ref<Color | 'spectator' | null>(null);
  const players = ref<{ white: string; black: string } | null>({ white: '', black: '' });
  const lastMove = ref<{
    from: { row: number; col: number };
    to: { row: number; col: number };
  } | null>(null);
  const validMoves = ref<{ row: number; col: number }[]>([]);
  const selectedPosition = ref<{ row: number; col: number } | null>(null);

  const winner = ref<Color | null>(null);
  const isGameOver = ref<boolean>(false);
  const moveHistory = ref<MoveRecord[]>([]);

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
      const rawBoard = state.board as unknown;
      if (
        rawBoard &&
        typeof rawBoard === 'object' &&
        'grid' in rawBoard &&
        Array.isArray((rawBoard as { grid: unknown }).grid)
      ) {
        board.value = (rawBoard as { grid: (Piece | null)[][] }).grid;
      }
      else if (Array.isArray(rawBoard)) {
        board.value = rawBoard as (Piece | null)[][];
      }
      else {
        board.value = [];
      }

      if (state.lastMove) {
        lastMove.value = state.lastMove;
      }

      if (state.players) {
        players.value = state.players;
      }

      turn.value = state.turn;

      winner.value = state.winner || null;
      isGameOver.value = state.isGameOver || false;

      if (state.history) {
        moveHistory.value = state.history;
      }

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

  function makeMove(
    from: { col: number; row: number },
    to: { col: number; row: number },
    promotion?: PieceType,
  ) {
    if (!roomId.value) {
      errorMessage.value = 'Not connected to any room.';
      return;
    }
    socketService.move(roomId.value, from, to, promotion);

    selectedPosition.value = null;
    clearValidMoves();
  }

  function disconnect() {
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
    lastMove,
    disconnect,
    players,
  };
});
