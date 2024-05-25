<template>
  <DuelRoom
    v-if="!loading"
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :game="game"
    :card-actions="cardActions"
    :game-logger="gameLogger"
    :room-id="roomId"
    :single="single"
  />
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import DuelRoom from './DuelRoom.vue';
import { reactive, ref, onMounted } from 'vue';
import { CardActions } from '@@/core/usecase/CardActions';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { PlayerType } from "@@/core/entities/player";
import { Deck, fetchDeck } from '@/helpers/Deck';
import { useRoomStore } from '@/stores/room';
import { Game } from '@@/core/entities/game';
import { deleteTemporarilySavedGame, getTemporarilySavedGame } from '@@/core/services/game.service';
import { fetchCardAbility } from '@@/core/services/card.service';

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
const lowerPlayer = route.query.player === "b" ? "b" : "a" as PlayerType
const upperPlayer = lowerPlayer === "a" ? "b" : "a" as PlayerType

// data
const game = reactive<Game>(Game.init())
const cardActions = new CardActions(game)
const { gameLogger } = GameLogger.useGameLogger(cardActions, roomId, lowerPlayer)
gameLogger.listenChanges()

onBeforeRouteLeave(() => {
  gameLogger.unsubscribes.forEach(u => u())
})

onMounted(async () => {
  // oncreated
  if (props.single) {
    const savedGame = getTemporarilySavedGame()
    if (savedGame) {
      deleteTemporarilySavedGame()
      game.players = savedGame.players
      game.cardDetails = savedGame.cardDetails
      roomStore.addCardDetails(savedGame.cardDetails)
      // カードの能力を取得
      Object.values(game.cardDetails).forEach(cardDetail => {
        fetchCardAbility(cardDetail.name)
      })
      game.histories = savedGame.histories
      gameLogger.setHistories(savedGame.histories)
      console.debug('get room data from session storage.')
      loading.value = false
      return
    }
    if (deckId) {
      const localDeck = await fetchDeck(deckId, roomStore)
      game.cardDetails = {
        ...game.cardDetails,
        ...roomStore.cardDetails,
      }
      if (!localDeck) {
        console.error('デッキの取得に失敗しました', deckId)
        return
      }
      game.players.a.deck = localDeck
      cardActions.selectDeck('a', await Deck.prepareDeckForGame(localDeck, true, true))
    }
    if (typeof route.query.deck_b === 'string' && route.query.deck_b) {
      const deckB = await fetchDeck(route.query.deck_b, roomStore)
      game.cardDetails = {
        ...game.cardDetails,
        ...roomStore.cardDetails,
      }
      game.players.b.deck = deckB
      cardActions.selectDeck('b', await Deck.prepareDeckForGame(deckB, false, true))
    }
    // カードの能力を取得
    Object.values(game.cardDetails).forEach(cardDetail => {
      fetchCardAbility(cardDetail.name)
    })
  }
  loading.value = false
})
</script>
