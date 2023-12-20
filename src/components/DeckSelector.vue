<template>
  <o-modal
    :active="active"
    :cancelable="canCansel"
    @close="onClose"
    :width="600"
  >
    <div id="deck-form" v-if="!isReady">
      <p class="deckForm_p">デッキを選択してください</p>
      <select name="deck" v-model="deckId">
        <option v-for="(deck, index) in allDecks" :key="index" :value="index">
          {{ deck.name }}
        </option>
      </select>
      <o-button
        @click.stop="onClickSelectButton"
        variant="info"
        :style="{ marginTop: '20px' }"
        >選択</o-button
      >
      <div :style="{ marginTop: '20px', width: '250px' }">
        <o-field
          class="deckForm_searchField"
          :variant="errors.scrapeUrl ? 'danger' : ''"
          :message="scraping ? 'デッキ取得中です' : errors.scrapeUrl"
        >
          <o-input
            v-model="scrapeUrl"
            placeholder="デッキメーカーのURLを貼り付ける"
            type="text"
            icon="search"
            :icon-clickable="!scraping"
            size="small"
            :expanded="true"
            :disabled="scraping"
            @keypress.prevent="onKeyPress"
            @icon-click="scrape"
          >
          </o-input>
          <a
            class="deckForm_searchField_help"
            href="https://note.com/tcgsimulator/n/n3f94a7d126f3#a7ea3459-6fe4-46d1-bc53-3bb7da71b792"
            target="_blank"
            rel="noopener"
          >
            <o-icon pack="far" icon="question-circle"></o-icon>
          </a>
        </o-field>
      </div>
      <div class="deckForm_example">
        <p>
          例:
          https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=xxxx
        </p>
      </div>
    </div>

    <template v-if="!isReady || !partnerIsReady">
      <hr v-if="!isReady" style="margin: 20px 0" />
      <div id="waiting-player">
        <p v-if="isReady" class="deckForm_p">
          相手プレイヤーがデッキを選択するのを待ってください。
        </p>
        <div v-if="player === 'a'">
          招待リンク:
          <span style="font-size: 12px">{{ inviteLink }}</span>
        </div>
        <div v-if="player === 'a'">
          <o-tooltip
            label="コピーしました"
            position="top"
            variant="info"
            size="small"
            :active="copyLinkTooltip"
            :triggers="['click']"
            :closeable="false"
          >
            <o-button variant="info" size="small" @click="copyInviteLink"
              >招待リンクをコピーする</o-button
            >
          </o-tooltip>
        </div>
      </div>
    </template>
  </o-modal>
</template>

<script>
import { Deck } from "@/helpers/Deck";
import axios from "axios";

export default {
  props: ["isReady", "player", "partnerIsReady", "active", "cancelable"],
  emits: ['move-cards', 'selected', 'update:active'],
  data() {
    return {
      deckId: 0,
      deckList: [],
      scrapeUrl: "",
      scraping: false,
      errors: {
        scrapeUrl: "",
      },
      copyLinkTooltip: false,
    };
  },
  watch: {
    /**
     * @param {String} newVal
     */
    scrapeUrl(newVal) {
      if (newVal) {
        if (newVal.match(/^https:\/\/gachi-matome.com\/deckrecipe-detail-dm/)) {
          this.scrape();
        } else {
          this.errors.scrapeUrl = "不適切なURLです";
          return;
        }
      }
      this.errors.scrapeUrl = "";
    },
  },
  computed: {
    canCansel() {
      if (this.cancelable) return true
      return this.isReady;
    },
    tabUrl() {
      // 相手プレイヤーのルームのURL
      const roomId = this.$route.query.roomId;
      const player = this.$route.query.player;
      return encodeURI(
        `/room?roomId=${roomId}&player=${player == "a" ? "b" : "a"}`
      );
    },
    allDecks() {
      return [...this.$store.state.decks.data, ...this.deckList];
    },
    inviteLink() {
      return (
        window.location.origin +
        "/room?roomId=" +
        encodeURI(this.$route.query.roomId) +
        "&player=b"
      );
    },
  },
  mounted() {
    axios
      .get('/api/decks')
      .then((res) => {
        this.deckList = [...this.deckList, ...res.data];
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    onClickSelectButton() {
      this.errors.scrapeUrl = ''
      this.scrapeUrl = this.allDecks[this.deckId].url
      this.scrape()
    },
    async setupDeck(deckData) {
      const deck = await Deck.prepareDeckForGame(
        deckData,
        this.player === "a"
      );
      console.log("selected deck", deck);
      // fromのカードは存在しなくても良いため、仮にyamafudaCardsにしている。
      const shieldCards = deck.cards.slice(0, 5);
      shieldCards.forEach((c) => {
        c.faceDown = true;
      });
      this.$emit(
        "move-cards",
        "yamafudaCards",
        "shieldCards",
        shieldCards,
        this.player
      );
      this.$emit(
        "move-cards",
        "yamafudaCards",
        "tefudaCards",
        deck.cards.slice(5, 10),
        this.player
      );
      const yamafudaCards = deck.cards.slice(10, 40);
      yamafudaCards.forEach((c) => {
        c.faceDown = true;
      });
      this.$emit(
        "move-cards",
        "yamafudaCards",
        "yamafudaCards",
        yamafudaCards,
        this.player
      );
      this.$emit(
        "move-cards",
        "yamafudaCards",
        "chojigenCards",
        deck.chojigenCards,
        this.player
      );
      this.$emit("selected", {
        deck,
        player: this.player,
      });
      if (this.partnerIsReady) {
        this.$emit("update:active", false);
      }
    },
    scrape() {
      if (!this.scrapeUrl || this.scraping || this.errors.scrapeUrl) return;
      this.scraping = true;
      const deckId = this.scrapeUrl.split('tcgrevo_deck_maker_deck_id=')[1]
      const url = `${this.useConfig().API_HOST}/api/scrape`;
      axios
        .get(url, {
          params: {
            deckId,
          }
        })
        .then((res) => {
          console.log("fetched deck", res);
          // this.$store.commit("decks/setData", [
          //   res.data,
          //   ...this.$store.state.decks.data,
          // ]);
          this.scrapeUrl = "";
          this.scraping = false;
          this.setupDeck(res.data)
        })
        .catch((err) => {
          // this.scrapeUrl = "";
          this.scraping = false;
          this.errors.scrapeUrl = "デッキデータの取得に失敗しました";
          console.log(err);
        });
    },
    onKeyPress() {
      this.errors.scrapeUrl = "ペーストのみ可能です";
    },
    onClose() {
      this.$emit("update:active", false);
    },
    copyInviteLink() {
      navigator.clipboard.writeText(this.inviteLink);
      this.copyLinkTooltip = true;
      window.setTimeout(() => {
        this.copyLinkTooltip = false;
      }, 1000);
    },
  },
};
</script>

<style lang="scss">
#deck-form {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 20px;
  > * {
    display: block;
  }
  p.deckForm_p {
    font-size: 20px;
    margin: 20px 0;
  }
}
#waiting-player {
  text-align: center;
  line-height: 30px;
  padding: 20px;
}
.deckForm_example {
  width: 100%;
  font-size: 12px;
  margin-top: 1rem;
  > * + * {
    margin-top: 1rem;
  }
}
.deckForm_searchField {
  &_help {
    color: #000;
    margin-left: 8px;
    align-self: center;
  }
}
</style>
