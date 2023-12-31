<template>
  <div class="content_wrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <div style="text-align: end;">
        <RouterLink class="topLink" to="/battle">
          対戦ツールはこちら(試作品)
        </RouterLink>
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
        :variant="DeckForm.deckUrlError.value ? 'danger' : ''"
        :message="DeckForm.scraping.value ? 'デッキ取得中です' : DeckForm.deckUrlError.value"
      >
        <OInput
          v-model="DeckForm.deckUrl.value"
          placeholder="デッキメーカーのURLを貼り付ける"
          type="text"
          icon="search"
          :expanded="true"
          :disabled="DeckForm.scraping.value"
          @keypress.prevent="DeckForm.onKeyPress()"
          @input="DeckForm.onDeckUrlChange()"
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

<script setup lang="ts">
import { getCloudRunCookie } from "@/helpers/Util";
import { makeRandomString } from "@/helpers/makeRandomString";
import axios from "axios";

import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter()

function useDeckForm() {
  const deckUrl = ref('')
  const deckUrlError = ref('')
  const scraping = ref(false)
  function onKeyPress() {
    deckUrlError.value = "ペーストのみ可能です";
  }
  function onDeckUrlChange() {
    const newVal = deckUrl.value
    if (!newVal) {
      deckUrlError.value = "";
      return;
    }
    if (
      !newVal.match(/^https:\/\/gachi-matome.com\/deckrecipe-detail-dm/) ||
      !newVal.includes("tcgrevo_deck_maker_deck_id=")
    ) {
      deckUrlError.value = "不適切なURLです";
      return;
    } else {
      if (scraping.value || deckUrlError.value) return;
      const deckId = newVal.split("tcgrevo_deck_maker_deck_id=")[1];
      scraping.value = true
      setTimeout(() => {
        router.push({
          path: "/single",
          query: { deck_id: deckId },
        });
      }, 500)
    }
    deckUrlError.value = "";
  }
  return {
    deckUrl,
    deckUrlError,
    scraping,
    onKeyPress,
    onDeckUrlChange,
  }
}

const DeckForm = useDeckForm()

const defaultDecks = [
  {
    name: "アナカラージャオウガ【2023/10・オリジナル】",
    id: "e724180f-a3a9-40d9-8e70-e11d85e9ec03",
  },
  {
    name: "4cガイアッシュ覇道【2021/12・オリジナル】",
    id: "da3e7dfb-948e-47d8-8924-d277368ca399",
  },
  {
    name: "デアリガズ墓地ソース【2021/12・オリジナル】",
    id: "a7aa7e2f-f2af-4271-b5d1-08ddaee92362",
  },
]


function randomRoomId() {
  return makeRandomString(4) + "-" + makeRandomString(3);
}
async function createRoom() {
  const router = useRouter()
  const roomId = randomRoomId();
  await axios.put(`/api/rooms/${roomId}`, {
    cookie: getCloudRunCookie(),
  });
  router.push({
    path: "room",
    query: { roomId, player: "a" },
  });
}
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
