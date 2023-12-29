<template>
  <DuelRoom
    :lowerPlayer="'a'"
    :upperPlayer="'b'"
    :room="{}"
    :roomId="'single'"
    :loading="loading"
    :deck="deck"
    :single="true"
  ></DuelRoom>
</template>

<script setup lang="ts">
import DuelRoom from "@/components/DuelRoom.vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { Deck as DeckType } from '@/entities/Deck'
import axios from "axios";
import { SocketUtil } from "../helpers/socket";
import { Deck } from "@/helpers/Deck";
import { computed, reactive, ref } from "vue";
import { RoomConfig } from "@/helpers/room";

onBeforeRouteLeave(() => {
  sessionStorage.removeItem('room')
  console.debug('deleted session storage cache')
})

const route = useRoute()
const router = useRouter()
const deckId = computed<string>(() => route.query.deck_id as string)

// data
const loading = ref(true)
const deck = ref<DeckType|null>(null);

// onCreated
(async function () {
  // validation
  if (!deckId.value) {
    router.push('/')
  }
  RoomConfig.useFirebase = false
  SocketUtil.socket = null
  let deckApi
  try {
    deckApi = await axios.get('/api/scrape', {
      params: {
        deckId: deckId.value,
      },
    });
  } catch (error) {
    console.error('デッキデータの取得に失敗しました', error)
    router.push('/')
    return;
  }
  deck.value = await Deck.prepareDeckForGame(deckApi.data, true);
  console.debug(deck.value)
  loading.value = false
})()
</script>
