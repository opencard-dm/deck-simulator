<template>
  <div v-if="isMounted">
    <div class="c-header" :style="{height: headerHeight}">
      <o-icon
        class="c-header__bars"
        pack="fas"
        icon="bars"
        size="small"
        style="color: white; margin-left: 20px; font-size: 24px;"
        @click.stop="sidebarOpen = !sidebarOpen"
      ></o-icon>
      <o-icon
        v-if="single"
        pack="fas"
        icon="undo"
        size="small"
        style="margin-left: 40px; font-size: 24px;"
        :style="{
          color: gameLogger.canundo() ? '#ddd' : 'gray'
        }"
        title="Ctrl + Z"
        @click.stop="undo()"
      ></o-icon>
      <o-icon
        v-if="single"
        pack="fas"
        icon="redo"
        size="small"
        style="color: #ddd; margin-left: 20px; font-size: 24px;"
        :style="{
          color: gameLogger.canredo() ? '#ddd' : 'gray'
        }"
        title="Ctrl + Y"
        @click.stop="redo()"
      ></o-icon>
    </div>
    <div
      class="sidebar"
      :class="{
        'sidebar--open': sidebarOpen,
      }"
    >
      <nav class="nav-links">
        <div class="nav-item">
          <router-link to="/">{{single ? 'トップページへ' : '退出する' }}</router-link>
        </div>
      </nav>
      <div style="margin-top: 30px; padding: 0px 20px;">
        <div>操作方法</div>
        <div>・カードを{{isPhone() ? 'タップ' : 'クリック'}}で選択</div>
        <div v-if="isPhone()">・カード画像を長押しで拡大</div>
        <div>・「マナ」や「シールド」ボタンを{{isPhone() ? 'タップ' : 'クリック'}}でポップアップを開く</div>
        <div>・山札を長押しで山札ポップアップを開く</div>
        <div>・「重ねる」ボタンは進化やギャラクシールドに使用する</div>
      </div>
      <nav class="nav-links" v-if="!single">
        <div class="nav-item">
          <a @click="openResetGameModal()">ゲームをリセットする</a>
        </div>
      </nav>
      <nav class="nav-links" v-if="canSaveLog">
        <div class="nav-item">
          <SaveLogForm 
            :game="game"
            :gameLogger="gameLogger"
          />
        </div>
      </nav>
      <nav class="nav-links" v-if="!single">
        <div class="nav-item">
          <div>
            招待リンク
            <o-tooltip
              label="コピーしました"
              position="top"
              variant="info"
              :triggers="['click']"
              :closeable="false"
              :active="copyLinkTooltip"
            ><o-icon class="sidebar_copyLinkIcon" pack="fas" icon="copy" @click="copyInviteLink"></o-icon
            ></o-tooltip>
          </div>
          <div style="font-size: 12px">{{ inviteLink }}</div>
        </div>
      </nav>
    </div>
    <!-- サイドバーのために使用する仮のモーダル -->
    <o-modal
      rootClass="sidebarModal"
      v-model:active="sidebarOpen"
      contentClass="sidebarModal__content"
    >
    </o-modal>
    <o-modal v-model:active="resetGameModal" :width="'fit-content'">
      <o-button variant="grey-dark" @click="resetGame()"
        >ゲームをリセットする</o-button
      >
    </o-modal>
  </div>
</template>

<script setup lang="ts">
import { Layout } from '@/helpers/layout'
import SaveLogForm from '@/components/SaveLogForm.vue'
import { computed, onMounted, ref } from 'vue';
import { isPhone } from '@/helpers/Util';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { PlayerType } from "@@/core/entities/player";
import { Game } from '@@/core/entities/game';

const props = defineProps<{
  single: boolean,
  game: Game,
  gameLogger: GameLogger,
  currentPlayer: PlayerType,
}>()

const emit = defineEmits([
  'reset-game',
  'switch-tab',
])

const headerHeight = `${Layout.headerHeight()}px`

const canSaveLog = computed(() => props.game.players.a.deck && props.game.players.a.deck.source !== 'googleSheet')

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
  document.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key == 'z') {
      undo()
    }
    if ((e.ctrlKey || e.metaKey) && e.key == 'y') {
      redo()
    }
  }
});

function undo() {
  if (!props.gameLogger.canundo()) {
    return
  }
  if (isPhone() && props.currentPlayer !== props.gameLogger.currentHistory?.player) {
    emit('switch-tab')
    return
  }
  props.gameLogger.undo()
}

function redo() {
  if (!props.gameLogger.canredo()) {
    return
  }
  if (isPhone() && props.currentPlayer !== props.gameLogger.nextHistory.player) {
    emit('switch-tab')
    return
  }
  props.gameLogger.redo()
}

</script>

<script lang="ts">
export default {
  data() {
    return {
      sidebarOpen: false,
      resetGameModal: false,
      copyLinkTooltip: false,
    };
  },
  computed: {
    inviteLink() {
      const opponentPlayer = this.player === "a" ? "b" : "a";
      return (
        window.location.origin +
        "/room?roomId=" +
        encodeURI(this.$route.query.roomId as string) +
        "&player=" +
        opponentPlayer
      );
    },
    player() {
      return this.$route.query.player;
    },
  },
  methods: {
    openResetGameModal() {
      this.sidebarOpen = false;
      this.resetGameModal = true;
    },
    resetGame() {
      this.resetGameModal = false;
      this.$emit("reset-game");
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

<style lang="scss" scoped>
.c-header {
  background-color: #005c98;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  display: flex;
  align-items: center;
  &--fixed {
    position: fixed;
    top: 0;
    z-index: 11;
  }
  .c-header__bars {
    cursor: pointer;
  }
}
.sidebar {
  a {
    color: #000;
    text-decoration: none;
  }
  a:hover {
    opacity: 0.8;
  }
  &_copyLinkIcon {
    &:hover {
      cursor: pointer;
    }
  }
  &.sidebar--open {
    transform: translateX(0%);
  }
  top: 10px;
  left: 0;
  bottom: 0;
  padding-top: 20px;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  font-size: 16px;
  background-color: #fff;
  width: 20rem;
  position: fixed;
  z-index: 41;
  border-right: 1px solid #eaecef;
  overflow-y: auto;
}
.sidebarModal {
  :deep(.sidebarModal__content) {
    display: none;
  }
}
.nav-links {
  .nav-item {
    > a {
      cursor: pointer;
    }
    line-height: 1.25rem;
    font-size: 1.1rem;
    padding: 0.5rem 0 0.5rem 1.5rem;
  }
}
</style>
