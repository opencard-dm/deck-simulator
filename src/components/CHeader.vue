<template>
  <div class="c-header">
    <o-icon
      class="c-header__bars"
      pack="fas"
      icon="bars"
      size="medium"
      style="color: white; margin-left: 30px"
      @click.stop="sidebarOpen = !sidebarOpen"
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
        <router-link to="/">退出する</router-link>
      </div>
    </nav>
    <nav class="nav-links">
      <div class="nav-item">
        <a @click="openResetGameModal()">ゲームをリセットする</a>
      </div>
    </nav>
    <nav class="nav-links">
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
    class="sidebarModal"
    v-model:active="sidebarOpen"
    contentClass="sidebarModal__content"
  >
  </o-modal>
  <o-modal v-model:active="resetGameModal" class="resetGameModal">
    <o-button variant="grey-dark" @click="resetGame()"
      >ゲームをリセットする</o-button
    >
  </o-modal>
</template>

<script>
export default {
  emits: ['reset-game'],
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
        encodeURI(this.$route.query.roomId) +
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
  height: 60px;
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
  &__bars {
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
  top: 60px;
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
.resetGameModal {
  :deep(.o-modal__content) {
    width: fit-content;
  }
}
</style>
