<template>
  <DuelRoom
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

<script lang="ts">
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import axios from 'axios';
import DuelRoom from './DuelRoom.vue';
import { RoomConfig, initialData } from '@/helpers/room';
import { defineComponent, reactive, ref } from 'vue';
import { CardActions } from '@/helpers/CardActions';
import { GameLogger } from '@/helpers/GameLogger';
import { player } from '@/entities';
import { Deck } from '@/helpers/Deck';
import { getCloudRunCookie } from '@/helpers/Util';
import { SourceDeck } from '@/entities/Deck';
import { useRoomStore } from '@/stores';

async function fetchDeck(deckId: string, store: ReturnType<typeof useRoomStore>) {
  const localDeck = Deck.getFromId(deckId)
  if (localDeck) {
    if (localDeck.cardDetails) {
      store.addCardDetails(localDeck.cardDetails)
    }
    if (localDeck.source === 'airtable') {
      const cardIds: string[] = []
      localDeck.cards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
      localDeck.chojigenCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
      localDeck.grCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
      const { data: cards } = await axios.get('/api/cards', {
        params: {
          cardIds: cardIds.join(',')
        }
      })
      store.addCardDetails(cards)
    }
    return await Deck.prepareDeckForGame(localDeck, true, true);
  }
  throw Error('デッキの取得に失敗しました')
}

export default defineComponent({
  components: {DuelRoom},
  props: {
    single: Boolean,
    roomId: String,
  },
  async setup(props) {
    const route = useRoute()  
    const router = useRouter()
    const roomStore = useRoomStore()
    const roomId = props.roomId as string
    const deckId = route.query.deck_id as string
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
        return {
          upperPlayer,
          lowerPlayer,
          cardActions,
          gameLogger,
          roomId,
          players,
        }
      }
      if (deckId) {
        const localDeck = Deck.getFromId(deckId)
        if (!localDeck) {
          console.error('デッキの取得に失敗しました', deckId)
          return
        }
        sourceDeck.value = localDeck
        cardActions.selectDeck('a', await fetchDeck(deckId, roomStore) as any)
        players.a.isReady = true
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
          cardActions.selectDeck('a', await fetchDeck(route.query.deck_a, roomStore) as any)
          players.a.isReady = true
        }
        if (typeof route.query.deck_b === 'string' && route.query.deck_b) {
          cardActions.selectDeck('b', await fetchDeck(route.query.deck_b, roomStore) as any)
          players.b.isReady = true
        }
      }
    }
    return {
      upperPlayer,
      lowerPlayer,
      cardActions,
      gameLogger,
      roomId,
      players,
      sourceDeck,
    }
  }
})
</script>
