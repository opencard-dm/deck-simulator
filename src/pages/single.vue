<template>
  <SingleRoom
    ref="roomComponent"
    :room="room"
    :loading="loading"
    :deck="deck"
    :single="true"
  ></SingleRoom>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SingleRoom from "@/components/SingleRoom.vue";
const roomComponent = ref<InstanceType<typeof SingleRoom> | null>(null);
</script>

<script lang="ts">
import axios from "axios";
import { SocketUtil } from "../helpers/socket";
import { Deck } from "@/helpers/Deck";
export default {
  beforeRouteLeave() {
    sessionStorage.removeItem('room')
    console.debug('deleted session storage cache')
  },
  data() {
    return {
      loading: true,
      deck: null,
      room: {
      },
    };
  },
  computed: {
    deckId() {
      return this.$route.query.deck_id;
    },
  },
  async created() {
    if (!this.deckId) {
      this.$router.push('/')
    }
    SocketUtil.socket = null
    let deckApi
    try {
      deckApi = await axios.get('/api/scrape', {
        params: {
          deckId: this.deckId,
        },
      });
    } catch (error) {
      console.error('デッキデータの取得に失敗しました', error)
      this.$router.push('/')
      return;
    }
    this.deck = await Deck.prepareDeckForGame(deckApi.data, true);
    console.debug(this.deck)
    this.loading = false
  },
};
</script>
