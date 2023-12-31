<template>
  <DuelRoom
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :card-actions="cardActions"
    :game-logger="gameLogger"
    :players="players"
    :roomId="roomId"
    :single="single"
    :deck="null"
  ></DuelRoom>
</template>

<script lang="ts">
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import axios from 'axios';
import DuelRoom from './DuelRoom.vue';
import { RoomConfig, initialData } from '@/helpers/room';
import { defineComponent, reactive } from 'vue';
import { CardActions } from '@/helpers/CardActions';
import { GameLogger } from '@/helpers/GameLogger';
import { player } from '@/entities';
import { Deck } from '@/helpers/Deck';
import { getCloudRunCookie } from '@/helpers/Util';

async function fetchDeck(deckId: string) {
  let deckApi
  const router = useRouter()
  try {
    deckApi = await axios.get('/api/scrape', {
      params: {
        deckId,
      },
    });
  } catch (error) {
    console.error('デッキデータの取得に失敗しました', error)
    router.push('/')
    return;
  }
  const deck = await Deck.prepareDeckForGame(deckApi.data, true);
  return CardActions.setupForPlayer(deck)
}

export default defineComponent({
  components: {DuelRoom},
  props: {
    single: Boolean,
    roomId: String,
  },
  async setup(props) {
    const route = useRoute()
    const roomId = props.roomId as string
    const deckId = route.query.deck_id as string
    // クエリストリングのplayerが未設定の場合はaにする
    const lowerPlayer = route.query.player === "b" ? "b" : "a" as player
    const upperPlayer = lowerPlayer === "a" ? "b" : "a" as player

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
        gameLogger.setHistories(parsed.histories)
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
    }
    if (RoomConfig.useFirebase) {
      await axios.get(`/api/rooms/${roomId}`, {
        params: {
          cookie: getCloudRunCookie(),
        }
      });
    }
    if (deckId) {
      players.a.cards = await fetchDeck(deckId) as any
      players.a.isReady = true
    }
    return {
      upperPlayer,
      lowerPlayer,
      cardActions,
      gameLogger,
      roomId,
      players,
    }
  }
})
</script>