<template>
  <div>
    <o-input
      v-model="logName"
      :disabled="saveHistoriesSent"
      size="small"
      :expanded="true"
    ></o-input>
  </div>
  <o-button size="small" variant="grey-dark" @click="saveHistories()"
    :disabled="saveHistoriesSent"
    >ログを保存する</o-button
  >
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { useAuthStore } from '@/stores/auth';
import { Game } from '@@/core/entities/game';

const props = defineProps<{
  game: Game,
  gameLogger: GameLogger,
}>()

const route = useRoute()
const router = useRouter()
const logName = ref(props.game.players.a.deck?.name || '')
const saveHistoriesSent = ref(false)
const authStore = useAuthStore()

function saveHistories() {
  if (saveHistoriesSent.value) return
  if (route.params.log_id) {
    // TODO: 
    alert('ログの更新機能は未実装です')
    return
  }
  saveHistoriesSent.value = true
  axios.post('/api/logs', {
    name: logName.value,
    histories: props.gameLogger.histories,
    deck: props.game.players.a.deck,
    deckb: props.game.players.b.deck,
    userId: authStore.user?.uid
  }).then((res) => {
    router.push('/logs/' + res.data.id)
  }).catch((error) => {
    console.error(error)
    alert('保存に失敗しました')
  })
}
</script>
