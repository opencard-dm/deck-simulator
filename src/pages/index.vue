<template>
  <div class="content_wrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <div style="text-align: end;">
        <RouterLink v-if="Features.battle" class="link" to="/battle">
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
          <th><div>デッキレシピ</div></th>
          <th><div></div></th>
        </thead>
        <tr v-for="deck in defaultDecks" :key="deck.dmDeckId">
          <td>
            <div style="text-align: left;">{{ deck.name }}</div>
          </td>
          <td style="text-align: center;">
            <a :href="deckRecipeLink(deck.dmDeckId)" target="deckRecipe">
              <o-icon pack="fas" icon="arrow-up-right-from-square"></o-icon>
            </a>
          </td>
          <td style="text-align: center;">
            <router-link
              :to="{
                path: '/single',
                query: { deck_id: deck.dmDeckId },
              }"
            >
              <o-button variant="info" size="small">動かしてみる</o-button>
            </router-link>
          </td>
        </tr>
      </table>
      <template v-if="Features.using_my_deck">
        <div style="font-weight: bolder; margin-top: 3rem;">ガチまとめに公開されているデッキを使いたい場合</div>
        <div>
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
        <div style="margin-top: 10px;">例）https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=xxx</div>
        <img src="/images/gachimatome-deck-detail.png" width="100%" alt="">
        <div style="font-weight: bolder; margin-top: 3rem;">自分で作成したデッキを使いたい場合 ※動画あり</div>
        <div>1. デッキメーカーでデッキを作成する</div>
        <div>
          <a class="link" target="_blank" rel="noopener" style="margin-left: 1rem;" href="https://deck-maker.com/dm/decks">https://deck-maker.com/dm/decks</a>
        </div>
        <div>2. 作成したデッキを公開する</div>
        <div>3. マイデッキ一覧で作成したデッキを選択し、「デッキを共有」、「note埋め込み用URLコピー」の順でデッキのURLをコピーする</div>
        <div>4. 下の入力欄にコピーしたURLをペーストする</div>
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
        <iframe width="360" height="640" 
          src="https://www.youtube.com/embed/XNTerDbltMU?loop=1&rel=0" 
          title="DECK SIMULATORで自分のデッキを使う方法" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen
        ></iframe>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCloudRunCookie } from "@/helpers/Util";
import { makeRandomString } from "@/helpers/makeRandomString";
import axios from "axios";
import { Features } from "@/features";

import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter()

function deckRecipeLink(deckId: string) {
  return `https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=${deckId}`
}

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

import defaultDecks from '../decks.json'

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
.link {
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
