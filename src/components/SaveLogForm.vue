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
    :disabled="!deck || saveHistoriesSent"
    >ログを保存する</o-button
  >
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { SourceDeck } from '@/entities/Deck';
import { GameLogger } from '@/helpers/GameLogger';

const props = defineProps<{
  gameLogger: GameLogger,
  deck: SourceDeck|null
}>()

const route = useRoute()
const router = useRouter()
const logName = ref(props.deck?.name || '')
const saveHistoriesSent = ref(false)

function saveHistories() {
  if (saveHistoriesSent.value) return
  if (route.params.log_id) {
    // TODO: 
    alert('ログの更新機能は未実装です')
    return
  }
  saveHistoriesSent.value = true
  const deck = JSON.parse(JSON.stringify(props.deck))
  delete deck.cardDetails
  axios.post('/api/logs', {
    name: logName.value,
    histories: props.gameLogger.histories,
    deck: props.deck
  }).then((res) => {
    router.push('/logs/' + res.data.id)
  })
}
</script>
