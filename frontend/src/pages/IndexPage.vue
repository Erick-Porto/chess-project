<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from 'src/stores/game-store';
import ChessBoard from 'src/components/ChessBoard.vue';

const store = useGameStore();
const roomIdInput = ref('sala1');
const playerNameInput = ref('Jogador 1');
const hasJoined = ref(false);

const join = () => {
  if (roomIdInput.value && playerNameInput.value) {
    store.joinRoom(roomIdInput.value, playerNameInput.value);
    hasJoined.value = true;
  }
};
</script>

<template>
  <q-page class="flex flex-center column bg-grey-2">
    <div v-if="!hasJoined" class="q-pa-md" style="max-width: 400px; width: 100%">
      <q-card>
        <q-card-section>
          <div class="text-h4 text-center q-mb-md">Projeto Xadrez</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="roomIdInput" label="Nome da Sala" outlined class="q-mb-md" />
          <q-input v-model="playerNameInput" label="Seu Nickname" outlined />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="Entrar no Jogo" color="primary" size="lg" @click="join" />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else>
      <div class="text-h5 q-my-md text-center">Sala: {{ store.roomId }}</div>
      <ChessBoard />
    </div>
  </q-page>
</template>
