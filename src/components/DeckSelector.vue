<template>
  <o-modal
    :active="active"
    :cancelable="canCansel"
    :width="600"
    @close="onClose"
  >
    <div
      v-if="!isReady"
      id="deck-form"
    >
      <p class="deckForm_p">
        デッキを選択してください
      </p>
      <select
        v-model="deckId"
        name="deck"
      >
        <option
          v-for="deck in firebaseDecks"
          :key="deck.id"
          :value="'firebase-' + deck.id"
        >
          {{ deck.name }}
        </option>
        <template
          v-for="(decksSource, sourceIndex) in userDecks"
          :key="sourceIndex"
        >
          <option
            v-for="deck in decksSource.decks"
            :value="sourceIndex + '-' + deck.name"
          >
            {{ deck.name }}
          </option>
        </template>
        <option
          v-for="(deck, sampleIndex) in deckList"
          :key="sampleIndex"
          :value="deck.name"
        >
          {{ deck.name }}
        </option>
      </select>
      <o-button
        variant="info"
        :style="{ marginTop: '20px' }"
        @click.stop="onClickSelectButton"
      >
        選択
      </o-button>
      <template v-if="Features.using_my_deck">
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
              @input="validateUrl()"
              @keypress.prevent="onKeyPress"
              @icon-click="scrape"
            />
            <a
              class="deckForm_searchField_help"
              href="https://note.com/tcgsimulator/n/n3f94a7d126f3#a7ea3459-6fe4-46d1-bc53-3bb7da71b792"
              target="_blank"
              rel="noopener"
            >
              <o-icon
                pack="far"
                icon="question-circle"
              />
            </a>
          </o-field>
        </div>
        <div class="deckForm_example">
          <p>
            例:
            https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=xxxx
          </p>
        </div>
      </template>
    </div>

    <template v-if="!isReady || !partnerIsReady">
      <hr
        v-if="!isReady"
        style="margin: 20px 0"
      >
      <div id="waiting-player">
        <p
          v-if="isReady"
          class="deckForm_p"
        >
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
            <o-button
              variant="info"
              size="small"
              @click="copyInviteLink"
            >
              招待リンクをコピーする
            </o-button>
          </o-tooltip>
        </div>
      </div>
    </template>
  </o-modal>
</template>

<script setup lang="ts">
import type { player } from "@/entities";
import type { Deck as DeckType, DecksSource, SourceDeck } from "@/entities/Deck";
import { CardActions } from "@/helpers/CardActions";
import { Deck, fetchDeck } from "@/helpers/Deck";
import { isPhone } from "@/helpers/Util";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import deckList from '../decks.json'
import { Features } from "@/features";
import { useDecksStore } from "@/stores/decks";
import { useRoomStore } from "@/stores/room";
import { getUserDecks } from "./builder/decks";

const route = useRoute()
const router = useRouter()
const decksStore = useDecksStore()
const props = defineProps<{
  player: player
  isReady: boolean
  partnerIsReady: boolean
  active: boolean
  cardActions: CardActions
}>()
const emit = defineEmits(['move-cards', 'selected', 'update:active'])

// data
const deckId = ref('')
const scrapeUrl = ref("")
const scraping = ref(false)
const errors = reactive({
  scrapeUrl: "",
})
const copyLinkTooltip = ref(false)

function validateUrl() {
  if (scrapeUrl.value) {
    if (scrapeUrl.value.match(/^https:\/\/gachi-matome.com\/deckrecipe-detail-dm/)) {
      scrape();
    } else {
      errors.scrapeUrl = "不適切なURLです";
      return;
    }
  }
  errors.scrapeUrl = "";
}
// computed
const canCansel = computed(() => {
  if (isPhone()) return true
  return props.isReady || props.player !== 'a';
})
const tabUrl = computed(() => {
  // 相手プレイヤーのルームのURL
  const roomId = route.query.roomId as string;
  const player = route.query.player as string;
  return encodeURI(
    `/room?roomId=${roomId}&player=${player == "a" ? "b" : "a"}`
  );
})
const userDecks = computed(() => {
  return decksStore.data
})
const inviteLink = computed(() => {
  return (
    window.location.origin +
    "/room?roomId=" +
    encodeURI(route.query.roomId as string) +
    "&player=b"
  );
})
const firebaseDecks = reactive<SourceDeck[]>([])
onMounted(async () => {
  const decks = await getUserDecks()
  if (decks && decks.length > 0) {
    firebaseDecks.push(...decks)
  }
  // axios
  //     .get('/api/decks')
  //     .then((res) => {
  //       deckList.push(...res.data as never[]);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
})

function onClickSelectButton() {
  errors.scrapeUrl = ''
  scrape()
}
async function setupDeck(deckData: SourceDeck) {
const sourceDeck = JSON.parse(JSON.stringify(deckData))
  const deck: DeckType = await Deck.prepareDeckForGame(
    deckData,
    props.player === "a"
  );
  console.log("selected deck", deck);
  emit("selected", {
    deck,
    sourceDeck,
  });
  if (props.partnerIsReady) {
    emit("update:active", false);
  }
}
function updateUrl(deckId: string) {
  const currentQuery = {...route.query}
  currentQuery[`deck_${props.player}`] = deckId
  if (route.path === '/room') return 
  router.replace({
    path: route.path,
    query: currentQuery,
  })
}
async function scrape() {
  if (scraping.value || errors.scrapeUrl) return;
  scraping.value = true;
  if (!deckId.value) {
    console.error('deckId is required')
  }
  // TODO: Deck.getFromId()と共通化
  const store = useRoomStore()
  const sourceDeck = await fetchDeck(deckId.value, store)
  if (!sourceDeck) {
    console.error('次のIDのデッキは見つかりませんでした', deckId.value)
  } else {
    console.debug('deck', sourceDeck)
  }
  updateUrl(deckId.value)
  scrapeUrl.value = "";
  scraping.value = false;
  setupDeck(sourceDeck)
}
function onKeyPress() {
  errors.scrapeUrl = "ペーストのみ可能です";
}
function onClose() {
  emit("update:active", false);
}
function copyInviteLink() {
  navigator.clipboard.writeText(inviteLink.value);
  copyLinkTooltip.value = true;
  window.setTimeout(() => {
    copyLinkTooltip.value = false;
  }, 1000);
}
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
