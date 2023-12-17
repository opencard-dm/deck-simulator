<template>
  <div class="content_wrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <div style="text-align: end;">
        <!-- <RouterLink class="topLink" to="/battle">
          対戦ツールはこちら(試作品)
        </RouterLink> -->
      </div>
      <div>
        このサイトではDECK MAKERで作成したデッキを動かすことができます。
      </div>
      <div>試しに次のデッキを動かしてみてください。</div>
      <table class="roomTable" style="margin-top: 20px">
        <thead>
          <th><div>デッキ名</div></th>
          <th><div></div></th>
        </thead>
        <tr v-for="deck in defaultDecks" :key="deck.id">
          <td>
            <div>{{ deck.name }}</div>
          </td>
          <td>
            <router-link
              :to="{
                path: '/single',
                query: { deck_id: deck.id },
              }"
            >
              <o-button variant="info" size="small">動かしてみる</o-button>
            </router-link>
          </td>
        </tr>
      </table>
      <div style="margin-top: 40px">
        <span
          >次の入力欄にガチまとめの公開済みデッキのURLを貼り付けることで、好きなデッキを動かすことができます。
        </span>
        <!-- <a
          class="deckForm_searchField_help"
          href="https://note.com/tcgsimulator/n/n3f94a7d126f3#a7ea3459-6fe4-46d1-bc53-3bb7da71b792"
          target="_blank"
          rel="noopener"
        >
          <o-icon pack="far" icon="question-circle"></o-icon>
        </a> -->
      </div>
      <div>自分で作成したデッキを使いたい場合、公開する必要があることに注意してください。</div>
      <OField
        class="deckForm_searchField"
        style="margin-top: 10px; max"
        :variant="deckUrlError ? 'danger' : ''"
        :message="scraping ? 'デッキ取得中です' : deckUrlError"
      >
        <OInput
          v-model="deckUrl"
          placeholder="デッキメーカーのURLを貼り付ける"
          type="text"
          icon="search"
          :expanded="true"
          :disabled="scraping"
          @keypress.prevent="onKeyPress"
          @input="onDeckUrlChange"
        >
        </OInput>
      </OField>
      <div style="margin-top: 20px;">例）</div>
      <img src="/images/gachimatome-deck-detail.png" width="100%" alt="">
      <!-- <p style="margin-top: 20px;">
        部屋を選択してください<a
          class="deckForm_searchField_help"
          href="https://note.com/tcgsimulator/n/n3f94a7d126f3#46479139-fd8d-4731-8329-32a75616f604"
          target="_blank"
          rel="noopener"
          style="vertical-align: middle"
        >
          <o-icon pack="far" icon="question-circle"></o-icon>
        </a>
      </p>
      <o-button variant="info" size="small" @click="createRoom()">部屋を作る</o-button> -->
    </div>
  </div>
</template>

<script>
import { makeRandomString } from "@/helpers/makeRandomString";
import axios from "axios";
import { OField, OInput } from "@oruga-ui/oruga-next";

export default {
  data() {
    return {
      deckUrl: "",
      deckUrlError: "",
      scraping: false,
      defaultDecks: [
        {
          name: "赤単我我我ブランド【2021/12・オリジナル】",
          id: "a4c9f4ea-0c42-4c7b-987b-a589f549f1d8",
        },
        {
          name: "4cガイアッシュ覇道【2021/12・オリジナル】",
          id: "da3e7dfb-948e-47d8-8924-d277368ca399",
        },
        {
          name: "デアリガズ墓地ソース【2021/12・オリジナル】",
          id: "a7aa7e2f-f2af-4271-b5d1-08ddaee92362",
        },
      ],
      rooms: [{ id: "1" }, { id: "2" }, { id: "3" }],
    };
  },
  computed: {
    decks() {
      return this.$store.state.decks.data;
    },
    readAbout() {
      return this.$store.state.setting.readAbout;
    },
  },
  methods: {
    onKeyPress() {
      this.deckUrlError = "ペーストのみ可能です";
    },
    onDeckUrlChange() {
      const newVal = this.deckUrl
      if (!newVal) {
        this.deckUrlError = "";
        return;
      }
      if (
        !newVal.match(/^https:\/\/gachi-matome.com\/deckrecipe-detail-dm/) ||
        !newVal.includes("tcgrevo_deck_maker_deck_id=")
      ) {
        this.deckUrlError = "不適切なURLです";
        return;
      } else {
        if (this.scraping || this.deckUrlError) return;
        const deckId = newVal.split("tcgrevo_deck_maker_deck_id=")[1];
        this.scraping = true
        setTimeout(() => {
          this.$router.push({
            path: "/single",
            query: { deck_id: deckId },
          });
        }, 500)
      }
      this.deckUrlError = "";
    },
    randomRoomId() {
      return makeRandomString(4) + "-" + makeRandomString(3);
    },
    getCloudRunCookie() {
      const cookie = document.cookie;
      let target = "";
      if (cookie) {
        cookie.split(";").forEach((seg) => {
          const trimed = seg.trim();
          if (trimed.startsWith("GAESA=")) {
            target = trimed;
          }
        });
      }
      return target;
    },
    async createRoom() {
      const roomId = this.randomRoomId();
      await axios.put(`/api/rooms/${roomId}`, {
        cookie: this.getCloudRunCookie(),
      });
      this.$router.push({
        path: "room",
        query: { roomId, player: "a" },
      });
    },
  },
  components: { OField, OInput },
};
</script>

<style lang="scss" scoped>
.topLink {
  color: #0969da;
  font-size: 14px;
}
.send {
  margin-left: 10px;
}
.content_wrapper {
  max-width: 600px;
  margin: 0 auto;
}
.deckForm_searchField {
  max-width: 600px;
}
.roomTable {
  border-collapse: collapse;
  th,
  td {
    border: 1px solid darkgray;
    padding: 5px 10px;
    > * {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
a {
  text-decoration: none;
  color: #000;
  &:hover {
    opacity: 0.8;
  }
}
.index_links {
  margin-top: 2rem;
  * + * {
    margin-top: 1rem;
  }
}

.deckForm_searchField_help {
  color: #000;
  margin-left: 8px;
  align-self: center;
}
</style>
