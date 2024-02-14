<template>
  <DuelRoom
    :upper-player="'b'"
    :lower-player="'a'"
    :card-actions="cardActions"
    :game-logger="gameLogger"
    :players="players"
    :roomId="roomId"
    :single="true"
    :sourceDeck="sourceDeck"
  ></DuelRoom>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import axios from 'axios';
import DuelRoom from '@/components/DuelRoom.vue';
import { RoomConfig, initialData } from '@/helpers/room';
import { reactive, ref } from 'vue';
import { CardActions } from '@/helpers/CardActions';
import { GameLogger } from '@/helpers/GameLogger';
import { useStore } from 'vuex';
import { SourceDeck } from '@/entities/Deck';
import { GameHistory } from '@/entities/History';

const route = useRoute()
const logId = route.params.log_id as string
const roomId = 'single'

const players = reactive(initialData(roomId).players)
players.a.isReady = true
const cardActions = new CardActions(roomId, players)
const { gameLogger } = GameLogger.useGameLogger(cardActions, 'a')
const sourceDeck = ref<SourceDeck|null>(null)
const store = useStore()

fetchLog(logId).then(async log => {
  const deck = log.deck
  sourceDeck.value = deck
  const cardIds: string[] = []
  deck.cards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
  deck.chojigenCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
  deck.grCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
  const { data: cards } = await axios.get('/api/cards', {
    params: {
      cardIds: cardIds.join(',')
    }
  })
  store.commit('addCardDetails', cards)
  // gameLogger.setHistories(log.histories)
  // TODO: 1ターン目の開始まででストップする
  log.histories.forEach(history => {
    gameLogger.receiveHistory(history)
  })
})

async function fetchLog(logId: string): Promise<{
  name: string,
  deck: SourceDeck,
  histories: GameHistory[],
}> {
  const { data: log } = await axios.get(`/api/logs/${logId}`)
  return log
}
</script>