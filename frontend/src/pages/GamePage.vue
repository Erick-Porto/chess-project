<template>
  <q-page class="flex flex-center bg-blue-grey-10 text-white">
    <div v-if="!store.isConnected" class="text-center">
      <q-spinner color="yellow" size="4em" />
      <div class="q-mt-md">Conectando ao servidor...</div>
    </div>

    <div
      v-else
      class="row q-col-gutter-md items-start q-pa-md"
      style="width: 100%; max-width: 1200px"
    >
      <div class="col-12 col-md-8 flex flex-center column">
        <div class="q-mb-sm text-h6 flex items-center">
          <q-avatar size="md" color="red" text-color="white" icon="person" class="q-mr-sm" />
          Oponente
        </div>

        <ChessBoard />

        <div class="q-mt-sm text-h6 flex items-center">
          <q-avatar size="md" color="green" text-color="white" icon="person" class="q-mr-sm" />
          {{ myName }} (Você - {{ store.myColor }})
        </div>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-blue-grey-9 text-white">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">Sala: {{ currentRoom }}</div>
            <q-btn flat round color="red" icon="logout" @click="leaveGame" title="Sair da Sala" />
          </q-card-section>

          <q-separator dark />

          <q-card-section>
            <div class="text-subtitle2">
              Vez de:
              <span :class="store.turn === Color.WHITE ? 'text-white' : 'text-grey-5'">
                {{ store.turn }}
              </span>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-section style="height: 300px; overflow-y: auto" class="scroll">
            <div class="text-caption text-grey-5 q-mb-xs">HISTÓRICO DE JOGADAS</div>
            <div v-for="(move, i) in store.moveHistory" :key="i" class="q-py-xs border-bottom">
              <q-badge color="primary" class="q-mr-sm">{{ i + 1 }}</q-badge>
              {{ formatMove(move) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed, onUnmounted } from 'vue';
import { useGameStore } from 'stores/game-store';
import { useRoute, useRouter } from 'vue-router';
import ChessBoard from 'components/ChessBoard.vue';
import { Color, type MoveRecord } from 'src/types/chess';

const store = useGameStore();
const route = useRoute();
const router = useRouter();

const currentRoom = computed(() => route.query.room as string);
const myName = computed(() => route.query.name as string);

const formatMove = (move: MoveRecord) => {
  return `[${move.from.row},${move.from.col}] ➔ [${move.to.row},${move.to.col}]`;
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
