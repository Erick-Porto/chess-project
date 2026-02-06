<script lang="ts" setup>
import { ref } from 'vue';
import { useGameStore } from 'src/stores/game-store';
import { Color, PieceType } from 'src/types/chess';

const store = useGameStore();

const selectedPosition = ref<{ row: number; col: number } | null>(null);

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

const handleSquareClick = (row: number, col: number) => {
  const piece = store.board[row]?.[col];

  if (store.selectedPosition && isMoveValid(row, col)) {
    store.makeMove(store.selectedPosition, { row, col });
    store.clearValidMoves();
  } else if (piece && piece.color === store.myColor && piece.color === store.turn) {
    store.selectedPosition = { row, col };
    store.fetchValidMoves(row, col);
  } else {
    selectedPosition.value = null;
    store.clearValidMoves();
  }
};

const isMoveValid = (row: number, col: number) => {
  return store.validMoves.some((move) => move.row === row && move.col === col);
};

const getSquareClass = (row: number, col: number) => {
  const isDark = (row + col) % 2 === 1;
  const isSelected = selectedPosition.value?.row === row && selectedPosition.value?.col === col;

  return {
    'bg-brown-5': isDark,
    'bg-brown-3': !isDark,
    'bg-yellow-4': isSelected,
    'relative-position': true,
  };
};
</script>

<template>
  <div class="chess-board shadow-24 rounded-borders overflow-hidden q-pa-sm">
    <q-banner v-if="store.errorMessage" class="bg-negative text-white q-mb-sm">
      {{ store.errorMessage }}
    </q-banner>

    <div class="board-grid" v-if="store.board.length">
      <div class="board-row" v-for="(row, rowIndex) in store.board" :key="rowIndex">
        <div
          class="board-square flex flex-center"
          v-for="(piece, colIndex) in row"
          :key="colIndex"
          :class="getSquareClass(rowIndex, colIndex)"
          @click="handleSquareClick(rowIndex, colIndex)"
        >
          <span v-if="piece" class="text-h3 piece-icon" :class="piece.color">
            {{ piece ? pieceIcons[`${piece.color}-${piece.type}`] : '' }}
          </span>

          <div class="valid-move-indicator" v-if="isMoveValid(rowIndex, colIndex)"></div>
        </div>
      </div>
    </div>

    <div class="text-center q-pa-xl" v-else>
      <q-spinner size="3em" color="primary" />
      <p>Loading board...</p>
    </div>
  </div>
</template>

<style scoped>
.board-grid {
  display: flex;
  flex-direction: column;
  border: 5px solid #5d4037;
  width: fit-content;
  margin: 0 auto;
}
.board-row {
  display: flex;
}
.board-square {
  width: 12.5vmin;
  height: 12.5vmin;
  max-width: 80px;
  max-height: 80px;
  user-select: none;
}
.piece-icon.white {
  color: #fff;
  text-shadow: 1px 1px 2px #000;
}
.piece-icon.black {
  color: #000;
}
.valid-move-indicator {
  position: absolute;
  width: 20%;
  height: 20%;
  border-radius: 50%;
  background-color: rgba(255, 255, 0, 0.7);
  top: 40%;
  left: 40%;
}

.board-square:has(.piece-icon.white, .piece-icon.black) .valid-move-indicator {
  background-color: transparent;
  border: 4px solid rgba(255, 0, 0, 0.4);
  /* width: 100%; */
  /* height: 100%; */
}
</style>
