<template>
  <q-page class="flex flex-center page-background">
    <div
      class="glass-panel q-pa-lg q-pa-md-xl text-center animated-entry"
      style="width: 100%; max-width: 480px"
    >
      <div class="q-mb-xl">
        <div class="avatar-container q-mb-md">
          <q-avatar size="100px" class="shadow-10 bg-grey-3 avatar-border">
            <img
              :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName || 'ChessMaster'}`"
              class="avatar-img"
            />
          </q-avatar>
        </div>

        <div class="text-h3 text-weight-bolder text-uppercase text-white letter-spacing-lg">
          Chess<span class="text-amber">Club</span>
        </div>
        <div class="text-subtitle1 text-grey-4 text-weight-light letter-spacing-sm q-mt-sm">
          Desafio Multiplayer WebSocket
        </div>
      </div>

      <q-form @submit="onSubmit" class="q-gutter-y-lg">
        <q-input
          filled
          dark
          v-model="playerName"
          label="Seu Nickname"
          color="amber"
          bg-color="white-05"
          class="input-rounded"
          :rules="[(val) => !!val || 'Como devemos te chamar?']"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="amber" />
          </template>
        </q-input>

        <q-input
          filled
          dark
          v-model="roomId"
          label="Nome da Sala (ex: sala1)"
          color="amber"
          bg-color="white-05"
          class="input-rounded"
          :rules="[(val) => !!val || 'Escolha uma sala para entrar']"
        >
          <template v-slot:prepend>
            <q-icon name="meeting_room" color="amber" />
          </template>
        </q-input>

        <q-btn
          type="submit"
          class="full-width btn-gradient text-weight-bold q-py-md shadow-10"
          size="lg"
          rounded
          no-caps
        >
          <span class="text-h6">Entrar na Partida</span>
          <q-icon name="arrow_forward" class="q-ml-sm" size="xs" />
        </q-btn>
      </q-form>

      <div class="q-mt-xl text-caption text-grey-6">Desenvolvido com NestJS + Vue 3 + Quasar</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const playerName = ref('');
const roomId = ref('');

const onSubmit = async () => {
  if (!playerName.value || !roomId.value) return;

  await router.push({
    path: '/game',
    query: {
      room: roomId.value,
      name: playerName.value,
    },
  });
};
</script>

<style scoped>
/* Fonte Moderna */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');

.page-background {
  background: radial-gradient(circle at center, #1e232a 0%, #0d1117 100%);
  font-family: 'Inter', sans-serif;
  color: #fff;
  overflow: hidden;
}

/* Glassmorphism Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 10;
}

/* Tipografia */
.letter-spacing-lg {
  letter-spacing: 4px;
}
.letter-spacing-sm {
  letter-spacing: 1px;
}

/* Avatar Styling */
.avatar-border {
  border: 4px solid rgba(255, 193, 7, 0.8); /* Amber border */
  padding: 2px;
  background: transparent;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.avatar-container:hover .avatar-border {
  transform: scale(1.05) rotate(3deg);
}

/* Inputs Customizados */
:deep(.q-field--filled .q-field__control) {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

:deep(.q-field--filled .q-field__control:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffc107; /* Amber */
}

.bg-white-05 {
  background: rgba(255, 255, 255, 0.05);
}

/* Botão Gradiente */
.btn-gradient {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #000;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 152, 0, 0.3);
}

.btn-gradient:active {
  transform: translateY(0);
}

/* Animação de Entrada */
.animated-entry {
  animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
