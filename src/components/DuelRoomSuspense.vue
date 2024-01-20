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
import { useStore } from 'vuex';

async function fetchDeck(deckId: string) {
  let deckApi
  const localDeck = Deck.getFromId(deckId)
  if (localDeck) {
    if (localDeck.cardDetails) {
      useStore().commit('addCardDetails', localDeck.cardDetails)
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
        useStore().commit('addCardDetails', parsed.cardDetails)
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
      if (deckId) {
        cardActions.selectDeck('a', await fetchDeck(deckId) as any)
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
        // console.log(await fetchDeck(deckId) as any)
        if (typeof route.query.deck_a === 'string' && route.query.deck_a) {
          cardActions.selectDeck('a', await fetchDeck(route.query.deck_a) as any)
          players.a.isReady = true
        }
        if (typeof route.query.deck_b === 'string' && route.query.deck_b) {
          cardActions.selectDeck('b', await fetchDeck(route.query.deck_b) as any)
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
    }
  }
})
</script>
