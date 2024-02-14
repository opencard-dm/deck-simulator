<template>
  <div class="content_wrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <div style="text-align: end;">
        <RouterLink v-if="Features.battle" class="link" to="/battle">
          対戦ツールはこちら(試作品)
        </RouterLink>
        <!-- <RouterLink class="link" to="/decks/edit">
          デッキ編集
        </RouterLink> -->
      </div>
      <div style="font-size: 12px;">DECK SIMULATORはファンコンテンツ・ポリシーに沿った非公式のファンコンテンツです。ウィザーズ社の認可/許諾は得ていません。題材の一部に、ウィザーズ・オブ・ザ・コースト社の財産を含んでいます。©Wizards of the Coast LLC</div>
      <div style="font-size: 12px; margin-top: 1rem;">本サービスは非公式、非営利目的であり公式の権益を損なう意図はありません。著作者様からサービス停止の要望があった場合には速やかに対処いたします。</div>
      <h2 class="h2" style="margin-top: 1rem;">一人回し支援ツール</h2>
      <div style="margin-top: 1rem;">本サービスでは、ユーザーがGoogleスプレッドシートで作成したデッキを一人回しすることができます。非公式のサービスとなりますので、私的利用に収まる範囲でご使用ください。</div>
      <div style="margin-top: 1rem;">下記の画像無しのサンプルデッキは本サービスの使用感を確かめるためのものとなっております。</div>
      <SampleDecks></SampleDecks>
      <GoogleSheetInput style="margin-top: 2rem;"/>
      <table class="roomTable" style="margin-top: 20px">
        <thead>
          <th><div>デッキ名</div></th>
          <th><div>カード枚数</div></th>
          <th colspan="3"><div></div></th>
        </thead>
        <template v-for="(decksSource, sourceIndex) in userDecks">
          <tr v-for="(deck, deckIndex) in decksSource.decks" :key="decksSource.url + deck.name">
            <td>
              <div style="text-align: left;">{{ deck.name }}</div>
            </td>
            <td>
              <div style="text-align: left;">{{ cardsNumInDeck(deck) }}</div>
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
            <td v-if="deckIndex === 0" :rowspan="decksSource.decks.length">
              <o-button variant="info" size="small" @click="updateDeckFromSource(decksSource.url)">更新</o-button>
            </td>
            <td v-if="deckIndex === 0" :rowspan="decksSource.decks.length">
              <a
                class="link"
                :href="decksSource.url.replace('/export', '/edit')"
                target="sheet"
                rel="noopener"
              >
                <span>シートを開く</span>
                <o-icon
                  pack="fas"
                  style="margin-left: 4px;"
                  icon="arrow-up-right-from-square"
                  size="small"
                ></o-icon>
              </a>
            </td>
          </tr>
        </template>
      </table>
      <div style="margin-top: 1rem;">
        <a
          class="link"
          href="https://docs.google.com/spreadsheets/d/1mqN0WQxLc5ksaUTnkZ_j23ODwUViUJIo1oJx-RjwkFA/copy?usp=sharing"
          target="_blank"
          rel="noopener"
        >
          <span>テンプレートファイルをコピー (Google スプレッドシート)</span>
          <o-icon
            pack="fas"
            style="margin-left: 4px;"
            icon="arrow-up-right-from-square"
            size="small"
          ></o-icon>
        </a>
      </div>
      <div style="font-weight: bolder; margin-top: 1rem;">デッキを動かすまでの手順(PC)</div>
      <div style="margin-bottom: 1rem;">ioradというサービスを使ったインタラクティブな説明が下部にあります。</div>
      <div>1. 上記のリンクでGoogleスプレッドシートのコピーを作成し、空のフォルダ内に移動する</div>
      <div>2. スプレッドシート上部のファイル名の右にあるフォルダアイコンをクリックし、現在のフォルダを新しいタブで開く</div>
      <div>3. フォルダをリンクを知っている全員が閲覧できるように共有する</div>
      <div>4. <a
        class="link"
        href="https://dm.takaratomy.co.jp/card/"
        target="_blank"
        rel="noopener"
      >公式のカード検索</a>を新しいウィンドウで開き、手順2のGoogleドライブのフォルダとの両方が見られる状態にする</div>
      <div>5. 公式のカード画像をGoogleドライブのフォルダにドラッグアンドドロップして、カード画像を追加する</div>
      <div>6. スプレッドシートのシートの1行目にある「画像IDを追加」ボタンをクリックする</div>
      <div>※ボタンを押すと、Google App Scriptが実行されるようになっており、認証が必要です。認証のモーダルが出るまで、2、3回ほどボタンを押してください。</div>
      <div>7. 手順4、5を繰り返し、枚数を調整することでデッキを作成する</div>
      <div>8. 下記の入力欄にスプレッドシートのURLをペーストする</div>
      <div>9. スプレッドシートを更新した場合は、再度URLをペーストする</div>
      <GoogleSheetInput style="margin-top: 0.5rem;"/>
      <GoogleSpreadsheetCopy/>
      <GoogleSpreadsheetDeck style="margin-top: 3rem;"/>
      <div style="font-weight: bolder; margin-top: 1rem;">デッキを動かすまでの手順(スマホ)</div>
      <div>スマートフォンでのデッキ作成作業はおすすめしません。PCでの作業で作成したスプレッドシートのURLを利用してください。</div>
      <div>1. PCで上記の「デッキを動かすまでの手順(PC)」を完了する</div>
      <div>2. スマートフォンでスプレッドシートのリンクを取得し、上記の入力欄に貼り付ける</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCloudRunCookie } from "@/helpers/Util";
import { makeRandomString } from "@/helpers/makeRandomString";
import SampleDecks from './index/SampleDecks.vue'
import GoogleSpreadsheetCopy from '@/components/explanations/GoogleSpreadsheetCopy.vue'
import GoogleSpreadsheetDeck from '@/components/explanations/GoogleSpreadsheetDeck.vue'
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

function cardsNumInDeck(deck: SourceDeck) {
  let num = 0
  for (const card of deck.cards) {
    num += card.times
  }
  let chojigenCardsNum = 0
  for (const card of deck.chojigenCards) {
    chojigenCardsNum += card.times
  }
  let grCardsNum = 0
  for (const card of deck.grCards) {
    grCardsNum += card.times
  }
  let expression = num.toString()
  const specialCardsExpressions = []
  if (chojigenCardsNum > 0) {
    specialCardsExpressions.push(`超次元:${chojigenCardsNum}`)
  }
  if (grCardsNum > 0) {
    specialCardsExpressions.push(`GR: ${grCardsNum}`)
  }
  if (specialCardsExpressions.length > 0) {
    expression += '(' + specialCardsExpressions.join(', ') + ')'
  }
  return expression
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
import { SourceDeck } from "@/entities/Deck";
import { fetchDeck } from "@/components/deck-inputs/GoogleSheetInput";

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
async function updateDeckFromSource(url: string) {
  const decksSource = await fetchDeck(url)
  console.log(decksSource)
  store.commit('decks/setData', decksSource)
}
</script>

<style lang="scss" scoped>
.h2 {
  font-size: 18px;
  font-weight: 500;
}
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
