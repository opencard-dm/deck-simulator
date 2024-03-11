<template>
  <div class="content_wrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <div style="text-align: end; margin-bottom: 8px;">
        <RouterLink v-if="Features.battle" class="link" to="/battle">
          対戦ツールはこちら(試作品)
        </RouterLink>
        <template v-if="loggedIn">
          <o-button 
            variant="warning" 
            size="small"
            style="margin-right: 4px;"
            @click="authStore.signOut()"
          >ログアウト</o-button>
          <RouterLink to="/decks/edit">
            <o-button
              variant="info"
              size="small"
            >デッキ編集</o-button>
          </RouterLink>
        </template>
        <o-button
          v-else
          variant="info"
          size="small"
          @click="authStore.signIn()"
        >ログイン</o-button>
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
      <UserDecks></UserDecks>
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
      <details>
        <summary style="font-weight: bolder; margin-top: 1rem;">デッキを動かすまでの手順(PC)</summary>
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
      </details>
      <details>
        <summary style="font-weight: bolder; margin-top: 1rem;">デッキを動かすまでの手順(スマホ)</summary>
        <div>スマートフォンでのデッキ作成作業はおすすめしません。PCでの作業で作成したスプレッドシートのURLを利用してください。</div>
        <div>1. PCで上記の「デッキを動かすまでの手順(PC)」を完了する</div>
        <div>2. スマートフォンでスプレッドシートのリンクを取得し、上記の入力欄に貼り付ける</div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import SampleDecks from '@/pages/index/SampleDecks.vue'
import GoogleSpreadsheetCopy from '@/components/explanations/GoogleSpreadsheetCopy.vue'
import GoogleSpreadsheetDeck from '@/components/explanations/GoogleSpreadsheetDeck.vue'
import { Features } from "@/features";
import GoogleSheetInput from "@/components/deck-inputs/GoogleSheetInput.vue";
import { computed, onMounted } from "vue";
import { DecksSource } from "@/entities/Deck";
import { useDecksStore } from "@/stores/decks";
import { useAuthStore } from "@/stores/auth";
import UserDecks from "@/components/UserDecks.vue";

const decksStore = useDecksStore()

onMounted(() => {
  // TODO: 2024/04/01ごろに削除する
  if (localStorage) {
    const vuex = localStorage.getItem('vuex')
    if (vuex !== null) {
      const deckSources = JSON.parse(vuex).decks.data
      deckSources.forEach((d: DecksSource) => {
        decksStore.addDecksSource(d)
      })
      localStorage.removeItem('vuex')
    }
  }
})

// auth
const authStore = useAuthStore()
const loggedIn = computed(() => authStore.loggedIn)

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
