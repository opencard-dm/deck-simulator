<template>
  <div class="content_wrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <div style="text-align: end;">
        <RouterLink v-if="Features.battle" class="link" to="/battle">
          対戦ツールはこちら(試作品)
        </RouterLink>
      </div>
      <h1>一人回し支援ツール</h1>
      <GoogleSheetInput></GoogleSheetInput>
      <table class="roomTable" style="margin-top: 20px">
        <thead>
          <th><div>デッキ名</div></th>
          <th><div></div></th>
        </thead>
        <template v-for="(decksSource, sourceIndex) in userDecks">
          <tr v-for="deck in decksSource.decks" :key="decksSource.url + deck.name">
            <td>
              <div style="text-align: left;">{{ deck.name }}</div>
            </td>
            <td style="text-align: center;">
              <router-link
                :to="{
                  path: '/single',
                  query: { deck_id: sourceIndex + '-' + deck.name },
                }"
              >
                <o-button variant="info" size="small">動かす</o-button>
              </router-link>
            </td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCloudRunCookie } from "@/helpers/Util";
import { makeRandomString } from "@/helpers/makeRandomString";
import FolderDrop from "@/components/FolderDrop.vue";
import axios from "axios";
import { Features } from "@/features";
import GoogleSheetInput from "@/components/deck-inputs/GoogleSheetInput.vue";

import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter()

function deckRecipeLink(deckId: string) {
  return `https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=${deckId}`
}

const store = useStore()
const userDecks = computed(() => {
  return store.state.decks.data
})

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
import { useStore } from "vuex";

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
