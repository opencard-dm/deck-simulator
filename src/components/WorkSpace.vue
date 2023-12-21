<template>
  <div v-if="workSpace.active">
    <div
      class="workSpace"
      :class="[
        {
          workSpace__minimum: workSpace.minimum,
        },
      ]"
    >
      <o-icon
        v-if="!workSpace.minimum"
        class="closeButton"
        pack="far"
        icon="times-circle"
        size="large"
        @click.stop="closeWorkSpace"
      ></o-icon>
      <!-- position absoluteで下につける -->
      <div class="bottomMenu">
        <div class="bottomMenu__overlay"></div>
      </div>
      <div class="workSpace_inner">
        <div class="workSpace_top">
          <div class="workSpace_top_1">
            <!-- ゾーン名をクリックしたときにも閉じる。 -->
            <o-button
              variant="grey-dark"
              outlined
              @click.stop="closeWorkSpace"
              >{{ (isOwner ? "" : "相手の") + zoneName }}</o-button
            >
            <template
              v-if="['manaCards', 'battleCards'].includes(workSpace.zone)"
            >
              <o-button v-if="!workSpace.single" @click.stop="untapAllCards"
                >全てアンタップする</o-button
              >
            </template>
            <o-button
              v-if="
                ['yamafudaCards'].includes(workSpace.zone) && !workSpace.single
              "
              @click.stop="shuffleCards('yamafudaCards', workSpace.cards)"
              >シャッフル</o-button
            >
            <template v-if="
                ['chojigenCards'].includes(workSpace.zone)
              ">
              <o-button
                @click.stop="faceDownAllCards(true)"
                >全て裏にする</o-button
              >
              <o-button
                @click.stop="faceDownAllCards(false)"
                >全て表にする</o-button
              >
            </template>
          </div>
        </div>
        <div class="workSpace_cardList gridCardList">
          <div
            v-for="card in orderedCards"
            :key="card.id"
            @mouseenter="setHoveredCard(card)"
            @mouseleave="setHoveredCard(null)"
          >
            <Dropdown class="dropdown" :triggers="dropdownTriggers">
              <template #trigger>
                <MarkTool
                  :active="cardIsSelected(card)"
                  :color="card.markColor"
                  @change="setMarkColor(card, $event)"
                >
                  <div class="card with-info" 
                    :class="{ tapped: card.tapped }"
                    :style="{ width: `${card.tapped ? cardHeight : cardWidth}px` }"
                  >
                    <span class="card-id card-info" v-if="card.groupId">{{
                      card.groupId
                    }}</span>
                    <div>
                      <!-- ワークスペース内だけでみられる状態がある -->
                      <img
                        :src="card.backImageUrl"
                        :width="cardWidth"
                        v-if="card.faceDown === true && !card.showInWorkSpace"
                      />
                      <CardPopup v-else :url="card.imageUrl">
                        <img :src="card.imageUrl" :width="cardWidth" />
                      </CardPopup>
                    </div>
                  </div>
                </MarkTool>
              </template>
              <o-dropdown-item class="drop-item">
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'battleCards')"
                  >出す</span
                >
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'tefudaCards')"
                  >手札へ</span
                >
              </o-dropdown-item>
              <o-dropdown-item class="drop-item">
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'yamafudaCards', true)"
                  >山札の上へ</span
                >
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'yamafudaCards')"
                  >/ 下へ</span
                >
              </o-dropdown-item>
              <o-dropdown-item class="drop-item">
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'shieldCards')"
                  >シールドへ</span
                >
                <span
                  v-if="isOwner"
                  class="drop-item-2"
                  @click="openCard(card)"
                  >裏返す</span
                >
              </o-dropdown-item>
              <o-dropdown-item class="drop-item">
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'manaCards')"
                  >マナ</span
                >
                <span
                  class="drop-item-2"
                  @click.stop="moveCard(card, 'bochiCards')"
                  >墓地へ</span
                >
              </o-dropdown-item>
            </Dropdown>
            <div class="card_bottomButton">
              <template v-if="['yamafudaCards'].includes(workSpace.zone)">
                <!-- 裏向きのカードを見るボタン -->
                <!-- 本人確認 -->
                <o-button
                  v-if="card.faceDown && !card.showInWorkSpace && isOwner"
                  @click.stop="card.showInWorkSpace = true"
                  :size="isPhone() ? 'small' : ''"
                  >見る</o-button
                >
                <!-- 見られる状態になったカードを場に出すボタン -->
                <o-button
                  v-if="card.showInWorkSpace"
                  @click.stop="moveCard(card, 'battleCards')"
                  :size="isPhone() ? 'small' : ''"
                  >出す</o-button
                >
              </template>

              <!-- ショートカット -->
              <template v-else-if="['tefudaCards'].includes(workSpace.zone)">
                <o-button @click.stop="moveCard(card, 'battleCards')"
                  :size="isPhone() ? 'small' : ''"
                  >出す</o-button
                >
                <o-button @click.stop="moveCard(card, 'manaCards')"
                  :size="isPhone() ? 'small' : ''"
                  >マナ</o-button
                >
              </template>
              <o-button
                v-else-if="
                  ['battleCards', 'bochiCards'].includes(workSpace.zone)
                "
                :size="isPhone() ? 'small' : ''"
                @click.stop="moveCard(card, 'tefudaCards')"
                >手札へ</o-button
              >
              <template v-else-if="['shieldCards'].includes(workSpace.zone)">
                <!-- 本人確認は無くした -->
                <o-button
                  v-if="card.faceDown && !card.showInWorkSpace"
                  @click.stop="card.showInWorkSpace = true"
                  :size="isPhone() ? 'small' : ''"
                  >見る</o-button
                >
                <template v-else>
                  <o-button @click.stop="moveCard(card, 'battleCards')"
                    :size="isPhone() ? 'small' : ''"
                    >出す</o-button
                  >
                  <o-button @click.stop="moveCard(card, 'tefudaCards')"
                    :size="isPhone() ? 'small' : ''"
                    >手札</o-button
                  >
                </template>
              </template>
              <template v-else-if="['manaCards'].includes(workSpace.zone)">
                <o-button v-if="!card.tapped" @click.stop="card.tapped = true"
                  :size="isPhone() ? 'small' : ''"
                  >タップ</o-button
                >
                <o-button v-else @click.stop="card.tapped = false"
                  :size="isPhone() ? 'small' : ''"
                  >アンタップ</o-button
                >
              </template>
            </div>
          </div>
        </div>
        <!-- 全て〇〇する系 -->
        <template v-if="!workSpace.single">
          <o-button
            v-if="
              ['yamafudaCards', 'shieldCards'].includes(workSpace.zone) &&
              isOwner
            "
            @click.stop="openAllCards"
            >全て見る</o-button
          >
          <o-button
            v-if="['manaCards', 'battleCards'].includes(workSpace.zone)"
            @click.stop="tapAllCards"
            >全てタップする</o-button
          >
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import CardPopup from './elements/CardPopup.vue'
const cardWidth = isPhone() ? 70 : 120
const cardHeight = cardWidth * 908 / 650

</script>

<script>
import mixin from "../helpers/mixin.js";
import { MarkTool } from "./index.js";
import { isPhone } from '@/helpers/Util';

export default {
  components: { MarkTool },
  mixins: [mixin.zone],
  props: ["lowerPlayer"],
  computed: {
    dropdownTriggers() {
      if (window.innerWidth >= 800 && !this.hasSelectedCard()) {
        return ["click", "hover"];
      }
      return ["click"];
    },
    player() {
      return this.$store.state.workSpace.player;
    },
    orderedCards() {
      if (this.workSpace.zone === "manaCards") {
        const tappedCards = this.workSpace.cards.filter((c) => c.tapped);
        const untappedCards = this.workSpace.cards.filter((c) => !c.tapped);
        return [...untappedCards, ...tappedCards];
      }
      return this.workSpace.cards;
    },
    zoneName() {
      const map = {
        manaCards: "マナゾーン",
        battleCards: "フィールド",
        bochiCards: "墓地",
        shieldCards: "シールドゾーン",
        tefudaCards: "手札",
        yamafudaCards: "山札",
        chojigenCards: "超次元ゾーン",
      };
      if (this.workSpace.single && this.workSpace.zone === "shieldCards") {
        return "シールド";
      }
      if (this.workSpace.zone === "yamafudaCards") {
        return `山札 (${this.workSpace.cards.length}枚)`;
      }
      if (Object.keys(map).includes(this.workSpace.zone)) {
        return map[this.workSpace.zone];
      }
      return "";
    },
    isOwner() {
      return this.player === this.lowerPlayer;
    },
  },
  watch: {
    // ワークスペースが開いている間は背景を薄くする。
    // ホバーで画像拡大はできるようにする。
    workSpace(newVal, oldVal) {
      if (!newVal.active) {
        // 閉じたとき
        oldVal.cards.forEach((c) => {
          c.showInWorkSpace = false;
        });
        // セレクトモードをオフにする。
        this.setSelectMode(null);
        // 状態を送信
        this.emitState();
      }
    },
  },
  methods: {
    openCard(card) {
      card.faceDown = !card.faceDown;
      this.$forceUpdate();
    },
    openAllCards() {
      // 山札とシールドでしか使わない想定
      this.workSpace.cards.forEach((c) => {
        c.showInWorkSpace = true;
      });
    },
    untapAllCards() {
      this.workSpace.cards.forEach((c) => {
        c.tapped = false;
      });
      this.closeWorkSpace();
    },
    tapAllCards() {
      this.workSpace.cards.forEach((c) => {
        c.tapped = true;
      });
      this.closeWorkSpace();
    },
    faceDownAllCards(faceDown = true) {
      // 超次元ゾーンで使用
      this.workSpace.cards.forEach((c) => {
        c.faceDown = faceDown;
      });
    },
    // 操作したプレイヤーだけが見ることができる。
    // カードを裏返すのとは違う。
    showAllInWorkSpace() {
      this.workSpace.cards.forEach((c) => {
        c.showInWorkSpace = true;
      });
    },
    moveCard(card, to, prepend = false) {
      // ワークスペースから移動したカードを消す。
      this.openWorkSpace({
        ...this.workSpace,
        cards: this.workSpace.cards.filter((c) => c.id !== card.id),
      });
      const from = this.workSpace.zone;
      // 見られる状態であれば、表向きにする
      if (card.showInWorkSpace) card.faceDown = false;
      // 見られる状態を解除
      card.showInWorkSpace = false;
      // バトルゾーン以外からシールドへ移動するときは裏向きにする。
      if (to === "shieldCards" && from !== "battleCards") {
        card.faceDown = true;
      }
      this.$emit(
        "move-cards",
        from,
        to,
        [card],
        this.workSpace.player,
        prepend
      );
      // カードが0枚になったらワークスペースを閉じる。
      if (this.workSpace.cards.length === 0) {
        this.closeWorkSpace();
      }
    },
    shuffleCards(from, cards) {
      this.$emit("shuffle-cards", from, cards, this.player);
      this.closeWorkSpace();
    },
    clickedOutside(event) {
      // 本来はワークスペースを開く要素全てを除く必要がある。
      if (
        event.target.closest(".workSpace") ||
        event.target.closest(".o-drop__menu")
      ) {
        return;
      }
      if (event.target.closest("#js_gameBoard")) {
        this.closeWorkSpace();
      }
    },
  },
  mounted() {
    if (typeof window !== "undefined") {
      document.addEventListener("click", this.clickedOutside);
    }
  },
  beforeUnmount() {
    if (typeof window !== "undefined") {
      document.removeEventListener("click", this.clickedOutside);
    }
  },
};
</script>

<style lang="scss">
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
.gridCardList {
  // スクロールをしないUIに変更
  display: flex;
  flex-wrap: wrap;
  max-width: 700px; // 800 - margin-left
  > * {
    // flex-shrink: 0;
    margin: 0 10px 10px 0;
  }
  .card {
    &.tapped {
      // 回転中心が左下の時ちょうど、回転後の位置がx軸方向について中心になる。
      // あとはtranslateXでy座標を調整する。
      transform: rotate(-90deg) translateX(100%);
      transform-origin: right bottom;
      // .o-drop__menu {
      //   z-index: 2;
      //   transform: rotate(90deg) translateY(100%) translateX(-175%);
      //   transform-origin: left bottom;
      // }
    }
  }
}
.workSpace {
  position: fixed;
  top: 10%;
  margin-left: 10px;
  max-width: 600px;
  z-index: 10;
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  @media screen and (max-device-width: 800px) {
    width: 96%;
    margin: 0 2%;
  }
  &__minimum {
    .workSpace_inner {
      max-width: 100px;
      max-height: 100px;
      overflow-y: auto;
    }
    .bottomMenu {
      display: none;
    }
  }
  &_inner {
    // height: 60vh;
    max-height: 60vh;
    overflow-y: auto;
    @media screen and (max-device-width: 800px) {
      margin: 0;
      max-width: 100%;
      max-height: 80vh;
      overflow-x: scroll;
    }
  }
  .closeButton {
    position: absolute;
    z-index: 1;
    right: 0px;
    top: 0px;
    transform: translateY(-100%);
    background-color: #fff;
    border-radius: 50%;
  }
  .minButton {
    position: absolute;
    z-index: 1;
    right: 72px; // 48 + 24
    top: 0;
    transform: translateY(-48px);
    background-color: #fff;
    border-radius: 50%;
    &__expand {
      width: 40px;
      height: 40px;
      right: 0;
      color: white;
      background-color: black;
    }
  }
  .workSpace_top_1 {
    display: flex;
    align-items: center;
    > * + * {
      margin-left: 8px;
    }
  }
  &_cardList {
    margin-top: 10px;
  }
  .card {
    position: relative;
  }
  .card_bottomButton {
    display: flex;
    justify-content: center;
  }
  .card-info {
    background-color: black;
    position: absolute;
    bottom: 0;
    left: 0;
    font-size: 12px;
    font-weight: bold;
    color: beige;
  }
  .o-drop__menu {
    top: 20px;
    padding: 0;
  }
  .o-drop__item {
    display: flex;
    justify-content: space-between;
  }
  .drop-item {
  }
  .drop-item-2 {
    font-size: 14px;
    display: inline-block;
    width: 100%;
    height: 100%;

    &:not(:first-child) {
      margin-left: 5px;
    }
    &:hover {
      background-color: lightgray;
    }
  }
}
.bottomMenu {
  position: absolute;
  z-index: 10;
  left: 0;
  bottom: 0;
  width: fit-content;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  &__overlay {
    // padding: 12px 10px;
    background-color: rgba(0, 0, 0, 0.35);
    display: flex;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    justify-content: center;
  }
  &__action {
    align-self: center;
  }
}
</style>
