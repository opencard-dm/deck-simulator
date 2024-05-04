<template>
  <DuelRoom
    v-if="!loading"
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :game="game"
    :card-actions="cardActions"
    :game-logger="gameLogger"
    :roomId="roomId"
    :single="single"
  ></DuelRoom>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import DuelRoom from './DuelRoom.vue';
import { reactive, ref, onMounted } from 'vue';
import { CardActions } from '@@/core/usecase/CardActions';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { player } from '@/entities';
import { Deck, fetchDeck } from '@/helpers/Deck';
import { useRoomStore } from '@/stores/room';
import { Game } from '@@/core/entities/game';

const props = defineProps<{
  single: boolean
  roomId: string
}>()

const route = useRoute()  
const roomStore = useRoomStore()
const roomId = props.roomId as string
const deckId = route.query.deck_id as string
const loading = ref(true)
// クエリストリングのplayerが未設定の場合はaにする
const lowerPlayer = route.query.player === "b" ? "b" : "a" as player
const upperPlayer = lowerPlayer === "a" ? "b" : "a" as player

// data
const game = reactive<Game>(Game.init())
const cardActions = new CardActions(roomId, game)
const { gameLogger } = GameLogger.useGameLogger(cardActions, lowerPlayer)
gameLogger.listenChanges()

onBeforeRouteLeave(() => {
  gameLogger.unsubscribes.forEach(u => u())
})

onMounted(async () => {
  // oncreated
  if (props.single) {
    const sessionRoom = sessionStorage.getItem(`room-${roomId}`)
    if (sessionRoom) {
      const parsed = JSON.parse(sessionRoom)
      game.players.a = parsed.players.a
      game.players.b = parsed.players.b
      roomStore.addCardDetails(parsed.cardDetails)
      gameLogger.setHistories(parsed.histories)
      console.debug('get room data from session storage. key=' + `room-${roomId}`)
      loading.value = false
      return
    }
    if (deckId) {
      const localDeck = await fetchDeck(deckId, roomStore)
      if (!localDeck) {
        console.error('デッキの取得に失敗しました', deckId)
        return
      }
      game.players.a.deck = localDeck
      cardActions.selectDeck('a', await Deck.prepareDeckForGame(localDeck, true, true) as any)
    }
    if (typeof route.query.deck_b === 'string' && route.query.deck_b) {
      const deckB = await fetchDeck(route.query.deck_b, roomStore)
      game.players.b.deck = deckB
      cardActions.selectDeck('b', await Deck.prepareDeckForGame(deckB, false, true) as any)
    }
  }
  loading.value = false
})
</script>
