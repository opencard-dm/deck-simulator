<template>
  <o-loading
    v-model:active="loading" 
    :full-page="true"
    icon="rotate"
  />
  <DuelRoom
    v-if="!loading"
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :game="game"
    :card-actions="cardActions"
    :game-logger="gameLogger"
    :room-id="roomId"
    :single="false"
  />
</template>

<script setup lang="ts">
import { RoomConfig } from '@/helpers/room';
import { ref, reactive, onMounted } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import DuelRoom from '@/components/DuelRoom.vue'
import { fetchCardDetails, fetchCardAbility } from '@@/core/services/card.service'
import { SourceDeck } from '@@/core/entities/Deck';
import { Game } from '@@/core/entities/game';
import { PlayerType } from '@@/core/entities/player';
import { CardActions } from '@@/core/usecase/CardActions';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { createRoom, fetchRoom } from '@@/core/services/room.service';
import { useRoomStore } from '@/stores/room';

RoomConfig.useFirebase = true
const route = useRoute()
const roomId = route.params.id as string
const loading = ref(true)
// クエリストリングのplayerが未設定の場合はaにする
const lowerPlayer = route.query.player === "b" ? "b" : "a" as PlayerType
const upperPlayer = lowerPlayer === "a" ? "b" : "a" as PlayerType

// data
const game = reactive<Game>(Game.init())
const cardActions = new CardActions(roomId, game)
const { gameLogger } = GameLogger.useGameLogger(cardActions, lowerPlayer)
const roomStore = useRoomStore()

onBeforeRouteLeave((to, from, next) => {
  console.log("room-" + roomId + "から退室しました")
  next()
})

onMounted(async () => {
  try {
    await prepareRoom()
  } catch (error) {
    console.error(error)
  }
  loading.value = false
})

async function prepareRoom() {
  let room = await fetchRoom(roomId)
  if (!room) {
    room = await createRoom(roomId)
  }
  if (room.deckA) {
    game.players.a.deck = room.deckA
  }
  if (room.deckB) {
    game.players.b.deck = room.deckB
  }

  if (game.players.a.deck) {
    await fetchCardDetailsAndStore(game.players.a.deck)
  }
  if (game.players.b.deck) {
    await fetchCardDetailsAndStore(game.players.b.deck)
  }
  // カードデータを取得した後に実行する
  gameLogger.listenChanges()
}

async function fetchCardDetailsAndStore(deck: SourceDeck) {
  const cardDetails = await fetchCardDetails(deck)
  roomStore.addCardDetails(cardDetails)
  Object.values(cardDetails).forEach(cardDetail => {
    fetchCardAbility(cardDetail.name)
  })
}
</script>
