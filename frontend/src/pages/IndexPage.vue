<template>
  <q-page class="flex flex-center bg-blue-grey-10 text-white">
    <q-card class="bg-blue-grey-9 shadow-10" style="width: 100%; max-width: 400px">
      <q-card-section class="text-center">
        <q-avatar size="100px" class="shadow-5 q-mb-sm">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"
            style="background: white; padding: 10px"
          />
        </q-avatar>
        <div class="text-h4 text-weight-bold">Chess Master</div>
        <div class="text-subtitle2 text-grey-4">Projeto Sênior WebSocket</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            dark
            v-model="playerName"
            label="Seu Nickname"
            color="yellow"
            :rules="[(val) => !!val || 'Nome é obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            filled
            dark
            v-model="roomId"
            label="ID da Sala (Ex: sala1)"
            color="yellow"
            :rules="[(val) => !!val || 'Sala é obrigatória']"
          >
            <template v-slot:prepend>
              <q-icon name="meeting_room" />
            </template>
          </q-input>

          <q-btn
            label="Entrar no Jogo"
            type="submit"
            color="primary"
            class="full-width q-mt-md"
            size="lg"
            icon="sports_esports"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const playerName = ref('');
const roomId = ref('');

const onSubmit = async () => {
  await router.push({
    path: '/game',
    query: {
      room: roomId.value,
      name: playerName.value,
    },
  });
};
</script>
