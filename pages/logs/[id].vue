<template>
  <ClientOnly>
    <DuelRoom
      :upper-player="'b'"
      :lower-player="'a'"
      :game="game"
      :card-actions="cardActions"
      :game-logger="gameLogger"
      :roomId="roomId"
      :single="true"
    ></DuelRoom>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import DuelRoom from '@/components/DuelRoom.vue';
import { reactive } from 'vue';
import { CardActions } from '@@/core/usecase/CardActions';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { SourceDeck } from '@@/core/entities/Deck';
import { Game } from '@@/core/entities/game';
import { useRoomStore } from '@/stores/room';
import { startTurnParams } from '@@/core/usecase/TurnActions';
import { fetchLog } from '@@/core/services/log.service'
import { fetchCardDetails, fetchCardAbility } from '@@/core/services/card.service'

const route = useRoute()
const logId = route.params.id as string
const roomId = 'single'

const game = reactive<Game>(Game.init())
const cardActions = new CardActions(game)
const { gameLogger } = GameLogger.useGameLogger(cardActions, roomId, 'a')
const roomStore = useRoomStore()

fetchLog(logId).then(async log => {
  // 後方互換性のため
  if (log.deck) {
    game.players.a.deck = log.deck
  }
  if (log.deckb) {
    game.players.b.deck = log.deckb
  }

  if (game.players.a.deck) {
    await fetchCardDetailsAndStore(game.players.a.deck)
  }
  if (game.players.b.deck) {
    await fetchCardDetailsAndStore(game.players.b.deck)
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
        game.players[history.args.player].turn.total = (history.args as startTurnParams).turn
      }
    }
  }
  gameLogger.histories = log.histories
})

async function fetchCardDetailsAndStore(deck: SourceDeck) {
  const cardDetails = await fetchCardDetails(deck)
  roomStore.addCardDetails(cardDetails)
  Object.values(cardDetails).forEach(cardDetail => {
    fetchCardAbility(cardDetail.name)
  })
}
</script>
