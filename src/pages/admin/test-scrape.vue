<template>
  <div class="markdownWrapper">
    <div style="display: flex;" v-for="deck in decks" :key="deck.url">
      <div style="width: 20%;">{{ deck.label }}</div>
      <o-button class="" @click="scrape(deck.url)" :loading="scraping">スクレイピング</o-button>
      <!-- <iframe :src="deck.url"></iframe> -->
    </div>
    <button></button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      scraping: false,
      decks: [
        {
          label: 'オリジナル サンプル1',
          url: 'https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=27604339-661f-4bb1-b96e-dd417a59c3da'
        },
        {
          label: '超次元8 サンプル1',
          url: 'https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=a55ad809-837c-4b85-901d-d8f39cd45cf1'
        },
        {
          label: '超次元1+GR サンプル1',
          url: 'https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=c2120318-b43a-4106-82d6-1f9e3437cb5c'
        },
      ]
    };
  },
  methods: {
    scrape(url) {
      if (!url || this.scraping) return;
      this.scraping = true;
      const apiUrl = `${this.useConfig().API_HOST}/api/scrape`;
      axios
        .get(apiUrl, {
          params: {
            deckId: url.split('tcgrevo_deck_maker_deck_id=')[1],
          }
        })
        .then((res) => {
          console.log("fetched deck", res);
          // this.$store.commit("decks/setData", [
          //   res.data,
          //   ...this.$store.state.decks.data,
          // ]);
          this.scraping = false;
        })
        .catch((err) => {
          this.scraping = false;
          console.error("デッキデータの取得に失敗しました", err);
        });
    },
  },
  created() {
    this.$store.commit("setting/set", {
      readAbout: true,
    });
  },
  mounted() {
    this.$nextTick(() => {
      document.querySelectorAll("a").forEach((link) => {
        if (!link.href.includes(window.location.origin)) {
          link.target = "_blank";
          link.rel = "noopener";
        }
      });
    });
  },
};
</script>

<style lang="scss">
</style>
