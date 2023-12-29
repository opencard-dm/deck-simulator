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
            @input="validateUrl()"
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

<script setup lang="ts">
import type { player } from "@/entities";
import type { Deck as DeckType } from "@/entities/Deck";
import { CardActions } from "@/helpers/CardActions";
import { Deck } from "@/helpers/Deck";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute()
const store = useStore()
const props = defineProps<{
  player: player
  isReady: boolean
  partnerIsReady: boolean
  active: boolean
  cancelable: boolean
  cardActions: CardActions
}>()
const emit = defineEmits(['move-cards', 'selected', 'update:active'])

// data
const deckId = ref(0)
const deckList = reactive([])
const scrapeUrl = ref("")
const scraping = ref(false)
const errors = reactive({
  scrapeUrl: "",
})
const copyLinkTooltip = ref(false)

function validateUrl() {
  if (scrapeUrl) {
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
  if (props.cancelable) return true
  return props.isReady;
})
const tabUrl = computed(() => {
  // 相手プレイヤーのルームのURL
  const roomId = route.query.roomId as string;
  const player = route.query.player as string;
  return encodeURI(
    `/room?roomId=${roomId}&player=${player == "a" ? "b" : "a"}`
  );
})
const allDecks = computed(() => {
  return [...store.state.decks.data, ...deckList];
})
const inviteLink = computed(() => {
  return (
    window.location.origin +
    "/room?roomId=" +
    encodeURI(route.query.roomId as string) +
    "&player=b"
  );
})
onMounted(() => {
  axios
      .get('/api/decks')
      .then((res) => {
        deckList.push(...res.data as never[]);
      })
      .catch((err) => {
        console.log(err);
      });
})

function onClickSelectButton() {
  errors.scrapeUrl = ''
  scrapeUrl.value = allDecks.value[deckId.value].url
  scrape()
}
async function setupDeck(deckData: DeckType) {
  const deck: DeckType = await Deck.prepareDeckForGame(
    deckData,
    props.player === "a"
  );
  console.log("selected deck", deck);
  emit("selected", {
    deck,
  });
  if (props.partnerIsReady) {
    emit("update:active", false);
  }
}
function scrape() {
  if (!scrapeUrl.value || scraping.value || errors.scrapeUrl) return;
  scraping.value = true;
  const deckId = scrapeUrl.value.split('tcgrevo_deck_maker_deck_id=')[1]
  axios
    .get('/api/scrape', {
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
      scrapeUrl.value = "";
      scraping.value = false;
      setupDeck(res.data)
    })
    .catch((err) => {
      // this.scrapeUrl = "";
      scraping.value = false;
      errors.scrapeUrl = "デッキデータの取得に失敗しました";
      console.log(err);
    });
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
