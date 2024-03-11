<template>
  <ClientOnly>
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
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import axios from 'axios';
import DuelRoom from '@/components/DuelRoom.vue';
import { RoomConfig, initialData } from '@/helpers/room';
import { reactive, ref } from 'vue';
import { CardActions } from '@/helpers/CardActions';
import { GameLogger } from '@/helpers/GameLogger';
import { SourceDeck } from '@/entities/Deck';
import { GameHistory } from '@/entities/History';
import { useRoomStore } from '@/stores/room';
import { startTurnParams } from '@/helpers/TurnActions';

const route = useRoute()
const logId = route.params.id as string
const roomId = 'single'

const players = reactive(initialData(roomId).players)
players.a.isReady = true
const cardActions = new CardActions(roomId, players)
const { gameLogger } = GameLogger.useGameLogger(cardActions, 'a')
const sourceDeck = ref<SourceDeck|null>(null)
const roomStore = useRoomStore()

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
  roomStore.addCardDetails(cards)
  const firstTurnId = log.histories.find(h =>
    h.method === 'startTurn' && h.args.player === 'a'
  )?.id
  if (firstTurnId) {
    for (const history of log.histories) {
      gameLogger.receiveHistory(history)
      if (history.id === firstTurnId) {
        break
      }
    }
    // 合計のターン数をセット
    for (const history of log.histories) {
      if (history.method === 'startTurn') {
        players[history.args.player].turn.total = (history.args as startTurnParams).turn
      }
    }
  }
  gameLogger.histories = log.histories
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
