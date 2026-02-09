<template>
  <div class="chess-board shadow-10 rounded-borders overflow-hidden q-pa-xs bg-brown-9">
    <q-banner v-if="store.errorMessage" dense class="bg-red text-white q-mb-xs rounded-borders">
      {{ store.errorMessage }}
    </q-banner>

    <div v-if="displayGrid.length" class="board-container">
      <div v-for="(row, rIndex) in displayGrid" :key="rIndex" class="board-row">
        <div
          v-for="(square, cIndex) in row"
          :key="cIndex"
          class="board-square flex flex-center"
          :class="getSquareClass(square.realRow, square.realCol)"
          @click="handleSquareClick(square.realRow, square.realCol)"
        >
          <span
            v-if="square.piece"
            class="text-h3 piece-icon"
            :class="square.piece.color === Color.WHITE ? 'text-white text-shadow' : 'text-black'"
          >
            {{ pieceIcons[`${square.piece.color}-${square.piece.type}`] }}
          </span>

          <div v-if="isMoveValid(square.realRow, square.realCol)" class="valid-marker"></div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center q-pa-xl text-white">
      <q-spinner size="3em" color="yellow" />
      <div class="q-mt-sm">Carregando tabuleiro...</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useGameStore } from 'src/stores/game-store';
import { Color, PieceType } from 'src/types/chess';
import { useQuasar } from 'quasar';

const store = useGameStore();
const $q = useQuasar();
const emit = defineEmits(['promotion']);

const pieceIcons: Record<string, string> = {
  [`${Color.WHITE}-${PieceType.PAWN}`]: '♙',
  [`${Color.WHITE}-${PieceType.ROOK}`]: '♖',
  [`${Color.WHITE}-${PieceType.KNIGHT}`]: '♘',
  [`${Color.WHITE}-${PieceType.BISHOP}`]: '♗',
  [`${Color.WHITE}-${PieceType.QUEEN}`]: '♕',
  [`${Color.WHITE}-${PieceType.KING}`]: '♔',
  [`${Color.BLACK}-${PieceType.PAWN}`]: '♟',
  [`${Color.BLACK}-${PieceType.ROOK}`]: '♜',
  [`${Color.BLACK}-${PieceType.KNIGHT}`]: '♞',
  [`${Color.BLACK}-${PieceType.BISHOP}`]: '♝',
  [`${Color.BLACK}-${PieceType.QUEEN}`]: '♛',
  [`${Color.BLACK}-${PieceType.KING}`]: '♚',
};

const showError = (msg: string) => {
  $q.notify({
    message: msg,
    color: 'red-5',
    icon: 'warning',
    position: 'top',
    timeout: 1500,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

const displayGrid = computed(() => {
  const board = store.board;
  if (!board || board.length === 0) return [];

  const grid = [];
  for (let row = 0; row < 8; row++) {
    const rowArray = [];
    for (let col = 0; col < 8; col++) {
      const piece = board[row]?.[col] ?? null;
      rowArray.push({ piece, realRow: row, realCol: col });
    }
    grid.push(rowArray);
  }

  if (store.myColor === Color.BLACK) {
    grid.reverse();
    grid.forEach((row) => row.reverse());
  }

  return grid;
});

const handleSquareClick = (realRow: number, realCol: number) => {
  const piece = store.board[realRow]?.[realCol];

  if ((store.myColor as string) === 'spectator' || !store.myColor) {
    showError('Você está apenas assistindo.');
    return;
  }

  if (store.selectedPosition && isMoveValid(realRow, realCol)) {
    const from = store.selectedPosition;
    const to = { row: realRow, col: realCol };
    const p = store.board[from.row]?.[from.col];

    const isPawn = p?.type === PieceType.PAWN;
    const isLastRank =
      (p?.color === Color.WHITE && to.row === 0) || 
      (p?.color === Color.BLACK && to.row === 7);

    if (isPawn && isLastRank) {
      emit('promotion', { from, to });
    } else {
      store.makeMove(from, to);
    }
    store.clearValidMoves();
    return;
  }

  
  if (!piece) {
    store.selectedPosition = null;
    store.clearValidMoves();
    return;
  }

  if (store.turn !== store.myColor) {
    showError("Não é sua vez de jogar!");
    return;
  }

  if (piece.color !== store.myColor) {
    showError('Você só pode mover suas próprias peças!');
    return;
  }

  store.selectedPosition = { row: realRow, col: realCol };
  store.fetchValidMoves(realRow, realCol);
};

const isMoveValid = (row: number, col: number) => {
  return store.validMoves.some((m) => m.row === row && m.col === col);
};

const isLastMove = (row: number, col: number) => {
  const last = store.lastMove;
  if (!last || !last.from || !last.to) return false;
  return (
    (last.from.row === row && last.from.col === col) || 
    (last.to.row === row && last.to.col === col)
  );
};

const getSquareClass = (realRow: number, realCol: number) => {
  const isDark = (realRow + realCol) % 2 === 1;
  const isSelected =
    store.selectedPosition?.row === realRow && store.selectedPosition?.col === realCol;
  const isLast = isLastMove(realRow, realCol);

  return [
    isDark ? 'square-dark' : 'square-light',
    isLast ? 'highlight-last' : '',
    isSelected ? 'highlight-selected' : '',
    'relative-position',
    'cursor-pointer',
    'transition-colors',
  ];
};
</script>

<style scoped>
.chess-board {
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  background-color: #302e2b;
  padding: 12px;
}

.board-container {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

.board-row {
  display: flex;
}

.board-square {
  width: 10vmin;
  height: 10vmin;
  max-width: 65px;
  max-height: 65px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.square-light {
  background-color: #ebecd0;
  color: #ebecd0;
}

.square-dark {
  background-color: #779556;
  color: #779556;
}

.piece-icon {
  font-size: 8vmin;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
}

.text-white.text-shadow {
  color: #ffffff !important;
  text-shadow: 0 0 2px #000;
}

.text-black {
  color: #1a1a1a !important;
}

.board-square:hover .piece-icon {
  transform: translateY(-4px);
}

.highlight-selected {
  background-color: rgba(255, 255, 51, 0.6) !important;
}

.highlight-last {
  background-color: rgba(155, 199, 0, 0.5) !important;
}

.transition-colors {
  transition: background-color 0.15s ease;
}

.valid-marker {
  width: 25%;
  height: 25%;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  position: absolute;
}

.board-square:has(.piece-icon) .valid-marker {
  background-color: transparent;
  border: 6px solid rgba(0, 0, 0, 0.15);
  width: 100%;
  height: 100%;
  border-radius: 0;
}

@media (min-width: 1024px) {
  .piece-icon {
    font-size: 50px;
  }
}
</style>