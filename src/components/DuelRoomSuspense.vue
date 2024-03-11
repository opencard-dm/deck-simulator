<template>
  <DuelRoom
    v-if="!loading"
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :card-actions="cardActions"
    :game-logger="gameLogger"
    :players="players"
    :roomId="roomId"
    :single="single"
    :sourceDeck="sourceDeck"
  ></DuelRoom>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import axios from 'axios';
import DuelRoom from './DuelRoom.vue';
import { RoomConfig, initialData } from '@/helpers/room';
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { CardActions } from '@/helpers/CardActions';
import { GameLogger } from '@/helpers/GameLogger';
import { player } from '@/entities';
import { Deck, fetchDeck } from '@/helpers/Deck';
import { getCloudRunCookie } from '@/helpers/Util';
import { SourceDeck } from '@/entities/Deck';
import { useRoomStore } from '@/stores/room';

const props = defineProps<{
  single: boolean
  roomId: string
}>()

const route = useRoute()  
const router = useRouter()
const roomStore = useRoomStore()
const roomId = props.roomId as string
const deckId = route.query.deck_id as string
const loading = ref(true)
// クエリストリングのplayerが未設定の場合はaにする
const lowerPlayer = route.query.player === "b" ? "b" : "a" as player
const upperPlayer = lowerPlayer === "a" ? "b" : "a" as player
const sourceDeck = ref<SourceDeck|null>()

// data
const players = reactive(initialData(roomId).players)
const cardActions = new CardActions(roomId, players)
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
      players.a = parsed.players.a
      players.b = parsed.players.b
      roomStore.addCardDetails(parsed.cardDetails)
      gameLogger.setHistories(parsed.histories)
      sourceDeck.value = parsed.sourceDeck
      console.debug('get room data from session storage. key=' + `room-${roomId}`)
      loading.value = false
      return
    }
    if (deckId) {
      const localDeck = await Deck.getFromId(deckId)
      if (!localDeck) {
        console.error('デッキの取得に失敗しました', deckId)
        return
      }
      sourceDeck.value = localDeck
      cardActions.selectDeck('a', await Deck.prepareDeckForGame(await fetchDeck(deckId, roomStore), true, true) as any)
      players.a.isReady = true
    }
    if (typeof route.query.deck_b === 'string' && route.query.deck_b) {
      cardActions.selectDeck('b', await Deck.prepareDeckForGame(await fetchDeck(route.query.deck_b, roomStore), false, true) as any)
      players.b.isReady = true
    }
  }
  if (RoomConfig.useFirebase) {
    const { data: room } = await axios.get(`/api/rooms/${roomId}`, {
      params: {
        cookie: getCloudRunCookie(),
      }
    });
    if (Array.isArray(room.histories) && room.histories.length === 0) {
      if (typeof route.query.deck_a === 'string' && route.query.deck_a) {
        cardActions.selectDeck('a', await Deck.prepareDeckForGame(await fetchDeck(deckId, roomStore), true, true) as any)
        players.a.isReady = true
      }
      if (typeof route.query.deck_b === 'string' && route.query.deck_b) {
        cardActions.selectDeck('b', await Deck.prepareDeckForGame(await fetchDeck(deckId, roomStore), false, true) as any)
        players.b.isReady = true
      }
    }
  }
  loading.value = false
})
</script>
