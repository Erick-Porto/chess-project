<template>
  <q-page class="flex flex-center page-background">
    <transition name="fade">
    </transition>

    <div v-if="!store.isConnected" class="text-center">
      <q-spinner-orbit color="amber" size="4em" />
      <div class="text-h6 q-mt-md text-amber">Conectando ao servidor...</div>
    </div>

    <div v-else class="row q-col-gutter-xl items-start q-pa-md layout-container">
      
      <div class="col-12 col-md-7 flex flex-center column">
        
        <div class="player-card glass-panel q-mb-md">
          <div class="row items-center">
            <q-avatar size="48px" class="q-mr-md shadow-2 bg-grey-3">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentName}`" />
            </q-avatar>
            <div>
              <div class="text-subtitle1 text-weight-bold text-white">{{ opponentName }}</div>
              <div class="text-caption text-grey-4 badge-color">{{ opponentColor }}</div>
            </div>
          </div>
        </div>

        <ChessBoard @promotion="handlePromotionRequest" />

        <div class="player-card glass-panel q-mt-md">
          <div class="row items-center">
            <q-avatar size="48px" class="q-mr-md shadow-2 bg-grey-3">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${myName}`" />
            </q-avatar>
            <div>
              <div class="text-subtitle1 text-weight-bold text-white">{{ myName }}</div>
              <div class="text-caption text-amber badge-color">VOCÊ ({{ store.myColor }})</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="glass-panel text-white no-shadow full-width">
          <q-card-section class="row items-center justify-between q-pb-none">
            <div class="text-h6 text-uppercase text-spacing">
              Sala: <span class="text-amber">{{ currentRoom }}</span>
            </div>
            <q-btn flat round icon="logout" color="white" @click="leaveGame" class="opacity-hover">
              <q-tooltip>Sair da Sala</q-tooltip>
            </q-btn>
          </q-card-section>

          <q-card-section class="q-pt-lg">
            <div
              class="turn-indicator"
              :class="store.turn === Color.WHITE ? 'bg-grey-2 text-black' : 'bg-grey-10 text-white'"
            >
              <span class="text-caption text-weight-bold">VEZ DE</span>
              <div class="text-h4 text-weight-bolder">
                {{ store.turn === store.myColor ? myName : opponentName }}
              </div>
            </div>

            <div
              v-if="store.isGameOver"
              class="text-red-5 text-center text-h6 text-weight-bold q-mt-md blink"
            >
              ⚠️ JOGO FINALIZADO
            </div>
          </q-card-section>

          <q-separator dark class="q-my-sm opacity-20" />

          <q-card-section class="history-container scroll">
            <div class="text-overline text-grey-4 q-mb-sm sticky-top">Histórico de Jogadas</div>

            <div v-if="store.moveHistory.length === 0" class="text-grey-6 text-center q-mt-md">
              A partida ainda não começou.
            </div>

            <div class="row q-col-gutter-xs">
              <div v-for="(move, i) in store.moveHistory" :key="i" class="col-6">
                <div class="move-pill">
                  <span class="move-index">{{ Math.floor(i / 2) + 1 }}.</span>
                  <span class="move-notation">
                    {{ move.notation }}
                    <span v-if="move.promotion" class="text-amber">={{ String(move.promotion).charAt(0).toUpperCase() }}</span>
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showGameOverDialog" persistent backdrop-filter="blur(4px)">
      <q-card
        class="glass-panel text-white text-center q-pa-lg shadow-24"
        style="min-width: 350px; border: 1px solid rgba(255, 255, 255, 0.2)"
      >
        <q-card-section>
          <q-icon name="emoji_events" size="80px" color="amber" />
          <div class="text-h3 q-mt-md text-weight-bolder text-uppercase text-amber">
            {{ winnerTitle }}
          </div>
          <div class="text-subtitle1 q-mt-sm text-grey-3">
            {{ winnerMessage }}
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-mt-md">
          <q-btn
            label="Voltar ao Menu"
            color="amber"
            text-color="black"
            push
            size="lg"
            to="/"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showPromotionDialog" persistent backdrop-filter="blur(4px)">
      <q-card class="glass-panel text-white q-pa-md text-center">
        <div class="text-h6 q-mb-md">Promover Peão para:</div>

        <div class="row q-gutter-md justify-center">
          <q-btn round color="amber" text-color="black" size="lg" @click="confirmPromotion('QUEEN')" class="text-h4">♕</q-btn>
          <q-btn round color="blue-grey" size="lg" @click="confirmPromotion('ROOK')" class="text-h4">♖</q-btn>
          <q-btn round color="blue-grey" size="lg" @click="confirmPromotion('BISHOP')" class="text-h4">♗</q-btn>
          <q-btn round color="blue-grey" size="lg" @click="confirmPromotion('KNIGHT')" class="text-h4">♘</q-btn>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed, onUnmounted, watch, ref } from 'vue';
import { useGameStore } from 'stores/game-store';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ChessBoard from 'components/ChessBoard.vue';
import { Color, type PieceType } from 'src/types/chess';

const store = useGameStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

watch(() => store.errorMessage, (msg) => {
  if (msg) {
    $q.notify({
      type: 'negative',
      message: msg,
      position: 'top',
      timeout: 3000,
      icon: 'error'
    });
    store.errorMessage = ''; 
  }
});

const opponentName = computed(() => {
  if (store.myColor === Color.WHITE) return store.players?.black || 'Aguardando...';
  if (store.myColor === Color.BLACK) return store.players?.white || 'Aguardando...';
  return 'Espectador';
});

const opponentColor = computed(() => {
  return store.myColor === Color.WHITE ? 'Pretas' : 'Brancas';
});

const currentRoom = computed(() => route.query.room as string);
const myName = computed(() => route.query.name as string);

const showGameOverDialog = ref(false);

const winnerTitle = computed(() => {
  if (!store.winner) return 'EMPATE!';
  return store.winner === store.myColor
    ? 'VITÓRIA!'
    : store.myColor === 'spectator'
      ? 'PARTIDA FINALIZADA'
      : 'DERROTA!';
});

const winnerMessage = computed(() => {
  if (!store.winner) return 'O jogo terminou em empate.';
  return store.winner === store.myColor
    ? 'Parabéns! Você dominou o tabuleiro.'
    : store.myColor === 'spectator'
      ? 'Partida finalizada.'
      : 'Xeque-mate. Mais sorte na próxima vez!';
});

watch(
  () => store.isGameOver,
  (gameOver) => {
    if (gameOver) {
      showGameOverDialog.value = true;
    }
  },
);

const showPromotionDialog = ref(false);
const pendingPromotionMove = ref<{
  from: { row: number; col: number };
  to: { row: number; col: number };
} | null>(null);

const handlePromotionRequest = (move: {
  from: { row: number; col: number };
  to: { row: number; col: number };
}) => {
  pendingPromotionMove.value = move;
  showPromotionDialog.value = true;
};

const confirmPromotion = (typeStr: string) => {
  const move = pendingPromotionMove.value;
  if (move) {
    store.makeMove(move.from, move.to, typeStr as PieceType);
  }
  showPromotionDialog.value = false;
  pendingPromotionMove.value = null;
};

const leaveGame = async () => {
  store.disconnect();
  await router.push('/');
};

onMounted(async () => {
  if (!currentRoom.value || !myName.value) {
    await router.push('/');
    return;
  }
  store.joinRoom(currentRoom.value, myName.value);
});

onUnmounted(() => {
  store.disconnect();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.page-background {
  background: radial-gradient(circle at top right, #2b3544 0%, #171a21 100%);
  font-family: 'Inter', sans-serif;
  color: #fff;
}

.layout-container {
  width: 100%;
  max-width: 1100px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.player-card {
  width: 100%;
  max-width: 480px;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
}

.badge-color {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  font-weight: 600;
}

.turn-indicator {
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.history-container {
  height: 350px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin: 16px 0;
  padding: 16px;
}

.sticky-top {
  position: sticky;
  top: 0;
  background: transparent;
  z-index: 1;
}

.move-pill {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 1.1em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.move-index {
  color: #7f8c8d;
  margin-right: 8px;
  width: 30px;
  display: inline-block;
  text-align: right;
}

.move-notation {
  color: #ecf0f1;
  font-weight: bold;
}

.text-spacing {
  letter-spacing: 2px;
}
.opacity-hover:hover {
  opacity: 0.7;
}
.opacity-20 {
  opacity: 0.2;
}

.blink {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% { opacity: 0; }
}
</style>