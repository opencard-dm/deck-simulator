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
            <o-button
              v-if="
                ['yamafudaCards', 'shieldCards'].includes(workSpace.zone) &&
                isOwner
              "
              variant="grey-dark"
              @click.stop="openAllCards"
              >全て見る</o-button
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
            @mouseenter="isPhone() ? null : setHoveredCard(card)"
            @mouseleave="isPhone() ? null : setHoveredCard(null)"
          >
            <o-dropdown class="dropdown" :triggers="dropdownTriggers">
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
                        v-if="card.faceDown === true && !card.showInWorkSpace"
                        :src="cardDetail(card).backImageUrl"
                        :width="cardWidth"
                      />
                      <CardPopup v-else :url="card.imageUrl" :card="card">
                        <TextCard
                          :card="card"
                          :width="cardWidth"
                          :selected="false"
                        ></TextCard>
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
                  v-if="!card.showInWorkSpace"
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
            </o-dropdown>
            <div class="card_bottomButton">
              <template v-if="['yamafudaCards'].includes(workSpace.zone)">
                <!-- 裏向きのカードを見るボタン -->
                <!-- 本人確認 -->
                <o-button
                  v-if="card.faceDown && !card.showInWorkSpace && isOwner"
                  @click.stop="card.showInWorkSpace = true"
                  :size="'small'"
                  >見る</o-button
                >
                <!-- 見られる状態になったカードを場に出すボタン -->
                <o-button
                  v-if="card.showInWorkSpace"
                  variant="danger"
                  @click.stop="moveCard(card, 'battleCards')"
                  :size="'small'"
                  >出す</o-button
                >
                <o-button
                  v-if="card.showInWorkSpace && workSpace.zone === 'yamafudaCards'"
                  variant="info"
                  @click.stop="moveCard(card, 'yamafudaCards')"
                  :size="'small'"
                  >下へ</o-button
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
                    variant="danger"
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
            v-if="['manaCards', 'battleCards'].includes(workSpace.zone)"
            @click.stop="tapAllCards"
            >全てタップする</o-button
          >
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardPopup from './elements/CardPopup.vue'
import TextCard from "./elements/TextCard.vue";
import { useZone, zoneEmit } from './zones/zone';
import mixin from "../helpers/mixin";
import { MarkTool } from "./index";
import { isPhone } from '@/helpers/Util';
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoomStore } from '@/stores/room';
import { side, zone, player } from '@/entities';
import { Card } from '@/entities/Card';

const cardWidth = isPhone() ? 70 : 100
const cardHeight = cardWidth * 908 / 650

const props = withDefaults(defineProps<{
  player?: player
  cards?: Card[]
  side?: side
  single: boolean
  lowerPlayer: player
}>(), {
  side: 'lower',
  // Typeエラーを防ぐためで使わない
  player: 'a',
  cards: () => [],
})

const roomStore = useRoomStore()

const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
  closeWorkSpace,
  setHoveredCard,
  cardIsSelected,
  setMarkColor,
  selectTargetMode,
  selectMode,
  setCardState,
  toggleTap,
  setSelectMode,
  hasSelectedCard,
  moveSelectedCard,
  shuffleCards,
  cardDetail,
  workSpace,
} = useZone(props, emit)

// computed
const dropdownTriggers = computed(() => {
  if (window.innerWidth >= 800 && !hasSelectedCard()) {
    return ["click", "hover"];
  }
  return ["click"];
})
const player = computed(() => roomStore.workSpace.player)
const orderedCards = computed(() => {
  if (workSpace.value.zone === "manaCards") {
    const tappedCards = workSpace.value.cards.filter((c) => c.tapped);
    const untappedCards = workSpace.value.cards.filter((c) => !c.tapped);
    return [...untappedCards, ...tappedCards];
  }
  return workSpace.value.cards;
})
const zoneName = computed(() => {
  const map = {
    manaCards: "マナゾーン",
    battleCards: "フィールド",
    bochiCards: "墓地",
    shieldCards: "シールドゾーン",
    tefudaCards: "手札",
    yamafudaCards: "山札",
    chojigenCards: "超次元ゾーン",
  };
  if (workSpace.value.single && workSpace.value.zone === "shieldCards") {
    return "シールド";
  }
  if (workSpace.value.zone === "yamafudaCards") {
    return `山札 (${workSpace.value.cards.length}枚)`;
  }
  if (Object.keys(map).includes(workSpace.value.zone) && workSpace.value.zone !== '') {
    return map[workSpace.value.zone];
  }
  return "";
})
const isOwner = computed(() => workSpace.value.player === props.lowerPlayer)

// watch
watch(workSpace, (newVal, oldVal) => {
  // ワークスペースが開いている間は背景を薄くする。
  // ホバーで画像拡大はできるようにする。
  if (!newVal.active) {
    // 閉じたとき
    oldVal.cards.forEach((c) => {
      c.showInWorkSpace = false;
    });
    // セレクトモードをオフにする。
    setSelectMode(null);
  }
})

// methods
function openCard(card: Card) {
  card.faceDown = !card.faceDown;
  // this.$forceUpdate();
}
function openAllCards() {
  // 山札とシールドでしか使わない想定
  workSpace.value.cards.forEach((c) => {
    c.showInWorkSpace = true;
  });
}
function untapAllCards() {
  workSpace.value.cards.forEach((c) => {
    c.tapped = false;
  });
  closeWorkSpace();
}
function tapAllCards() {
  workSpace.value.cards.forEach((c) => {
    c.tapped = true;
  });
  closeWorkSpace();
}
function faceDownAllCards(faceDown = true) {
  // 超次元ゾーンで使用
  workSpace.value.cards.forEach((c) => {
    c.faceDown = faceDown;
  });
}
// 操作したプレイヤーだけが見ることができる。
// カードを裏返すのとは違う。
function showAllInWorkSpace() {
  workSpace.value.cards.forEach((c) => {
    c.showInWorkSpace = true;
  });
}
function moveCard(card: Card, to: zone, prepend = false) {
  // ワークスペースから移動したカードを消す。
  openWorkSpace({
    ...workSpace.value,
    cards: workSpace.value.cards.filter((c) => c.id !== card.id),
  });
  const from = workSpace.value.zone;
  // 見られる状態であれば、表向きにする
  if (card.showInWorkSpace) card.faceDown = false;
  // 見られる状態を解除
  card.showInWorkSpace = false;
  emit(
    "move-cards",
    from,
    to,
    [card],
    workSpace.value.player,
    prepend
  );
  // カードが0枚になったらワークスペースを閉じる。
  if (workSpace.value.cards.length === 0) {
    closeWorkSpace()
  }
}
function clickedOutside(event: Event) {
  // 本来はワークスペースを開く要素全てを除く必要がある。
  if (
    event.target?.closest(".workSpace") ||
    event.target?.closest(".o-drop__menu")
  ) {
    return;
  }
  if (event.target?.closest("#js_gameBoard")) {
    setHoveredCard(null)
    closeWorkSpace()
  }
}

// event handlers
onMounted(() => {
  if (typeof window !== "undefined") {
    document.addEventListener("click", clickedOutside);
  }
})
onUnmounted(() => {
  if (typeof window !== "undefined") {
    document.removeEventListener("click", clickedOutside);
  }
})
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
  @media screen and (max-width: 800px) {
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
    overflow-x: hidden;
    @media screen and (max-width: 800px) {
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
    background-color: white;
    padding: 0px 4px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    position: absolute;
    bottom: 0;
    right: 4px;
    font-size: 10px;
    font-weight: bold;
    color: black;
    z-index: 1;
  }
  .o-drop__menu {
    top: 20px;
    padding: 0;
    width: 120px;
    min-width: unset;
  }
  .o-drop__item {
    display: flex;
    justify-content: space-between;
  }
  .drop-item {
    padding: 5px 0px;
    width: 120px;
  }
  .drop-item-2 {
    font-size: 12px;
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
