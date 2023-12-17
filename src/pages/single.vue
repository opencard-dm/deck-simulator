<template>
  <DuelRoom
    :upper-player="'b'"
    :lower-player="'a'"
    :room="room"
    :loading="loading"
    :deck="deck"
    :single="true"
  ></DuelRoom>
</template>

<script>
import axios from "axios";
import DuelRoom from "../components/DuelRoom.vue";
import { SocketUtil } from "../helpers/socket";
import { Deck } from "@/helpers/Deck";

export default {
  components: { DuelRoom },
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
