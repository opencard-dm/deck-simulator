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
import { GameLogger } from '../../core/usecase/GameLogger';
import { SourceDeck } from '@/entities/Deck';
import { GameHistory } from '../../core/entities/game';
import { useRoomStore } from '@/stores/room';
import { startTurnParams } from '@/helpers/TurnActions';
import { fetchLog } from '../../core/services/log.service'

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
  fetchCardDetails(deck)
  if (log.deckb) {
    fetchCardDetails(log.deckb)
  }
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
      if (history.player === 'b' && !players.b.isReady) {
        players.b.isReady = true
      }
    }
  }
  gameLogger.histories = log.histories
})


async function fetchCardDetails(deck: SourceDeck) {
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
}
</script>
