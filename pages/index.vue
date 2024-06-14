<template>
  <div class="content_wrapper">
    <div
      id="app"
      style="padding: 20px; background-color: white"
    >
      <div style="text-align: end; margin-bottom: 8px;">
        <RouterLink
          v-if="Features.battle"
          class="link"
          to="/battle"
        >
          対戦ツールはこちら(試作品)
        </RouterLink>
        <template v-if="loggedIn">
          <o-button 
            variant="warning" 
            size="small"
            style="margin-right: 4px;"
            @click="authStore.signOut()"
          >
            ログアウト
          </o-button>
          <RouterLink to="/logs">
            <o-button
              variant="info"
              size="small"
              style="margin-right: 4px;"
            >
              ログ一覧
            </o-button>
          </RouterLink>
          <RouterLink to="/decks/edit">
            <o-button
              variant="info"
              size="small"
            >
              デッキ編集
            </o-button>
          </RouterLink>
        </template>
        <o-button
          v-else
          variant="info"
          size="small"
          @click="authStore.signIn()"
        >
          ログイン（Google）
        </o-button>
        <!-- <RouterLink class="link" to="/decks/edit">
          デッキ編集
        </RouterLink> -->
      </div>
      <div style="font-size: 12px;">
        DECK SIMULATORはファンコンテンツ・ポリシーに沿った非公式のファンコンテンツです。ウィザーズ社の認可/許諾は得ていません。題材の一部に、ウィザーズ・オブ・ザ・コースト社の財産を含んでいます。©Wizards of the Coast LLC
      </div>
      <div style="font-size: 12px; margin-top: 1rem;">
        本サービスは非公式、非営利目的であり公式の権益を損なう意図はありません。著作者様からサービス停止の要望があった場合には速やかに対処いたします。
      </div>
      <h2
        class="h2"
        style="margin-top: 1rem;"
      >
        一人回し支援ツール
      </h2>
      <div style="margin-top: 1rem;">
        本サービスでは、ユーザーが本サイト上で作成したデッキを一人回しすることができます。非公式のサービスとなりますので、私的利用に収まる範囲でご使用ください。
      </div>
      <div style="margin-top: 1rem;">
        下記の画像無しのサンプルデッキは本サービスの使用感を確かめるためのものとなっております。
      </div>
      <SampleDecks />
      <UserDecks />
      <div style="margin-top: 1rem;">
        <a
          class="link"
          href="https://docs.google.com/document/d/1NvIiEeC8_47F0r8_crlG5QJl1KQmwzN-3AFfYmFFL84/edit?usp=sharing"
          target="_blank"
          rel="noopener"
        >
          <span>デッキ編集機能について</span>
          <o-icon
            pack="fas"
            style="margin-left: 4px;"
            icon="arrow-up-right-from-square"
            size="small"
          />
        </a>
      </div>
      <div style="margin-top: 1rem;">
        ※デッキ編集機能の実装に伴い、以前のGoogleスプレッドシートからデッキを作成する機能はなくなりました。
      </div>
    </div>
    <IndexFooter />
  </div>
</template>

<script setup lang="ts">
import SampleDecks from '@/pages/index/SampleDecks.vue'
import GoogleSpreadsheetCopy from '@/components/explanations/GoogleSpreadsheetCopy.vue'
import GoogleSpreadsheetDeck from '@/components/explanations/GoogleSpreadsheetDeck.vue'
import { Features } from "@/features";
import GoogleSheetInput from "@/components/deck-inputs/GoogleSheetInput.vue";
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import UserDecks from "@/components/UserDecks.vue";
import IndexFooter from "@/components/IndexFooter.vue";

useHead({
  title: 'DECK SIMULATOR | デュエマのデッキの一人回しができる！',
  meta: [
    { name: 'description', content: 'デュエル・マスターズのデッキを一人回しできるサイトです！' }
  ],
})

// auth
const authStore = useAuthStore()
const loggedIn = computed(() => authStore.loggedIn)

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
