<template>
  <div class="shield-zone" :class="side">
    <div
      v-for="(card, index) in countableShieldCards"
      :key="index"
      class="shield"
      :class="{
        'is-selectMode': selectTargetMode(),
        'is-selected': cardIsSelected(card),
      }"
      @click.stop="clickShield(card)"
      @mouseenter="setHoveredCard(card)"
      @mouseleave="setHoveredCard(null)"
    >
      <MarkTool
        :reverse="side === 'upper'"
        :active="cardIsSelected(card)"
        :color="card.markColor"
        @change="setMarkColor(card, $event)"
      >
        <div class="shield-card card">
          <span class="shield-id">{{ card.shieldId }}</span>
          <!-- 裏向きのカードの場合表示されない。 -->
          <img v-if="!card.faceDown" :src="card.imageUrl" />
          <img v-else :src="card.backImageUrl" />
          <div
            v-if="card.groupId && group(card).cardIds.length > 1"
            class="shield-num"
          >
            {{ group(card).cardIds.length }}
          </div>
        </div>
        <div v-if="cardIsSelected(card)" class="card_buttons">
          <o-button
            variant="grey-dark"
            size="small"
            @click.stop="
              openWorkSpace({
                zone: 'shieldCards',
                cards: card.groupId ? group(card).cards : [card],
                player: player,
                single: true,
              })
            "
            >確認</o-button
          >
        </div>
      </MarkTool>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkTool from "../mark-tool/MarkTool.vue";
import { computed } from 'vue'
import type { player, side, } from "@/entities";
import { Card, CardGroup } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";

const props = defineProps<{
  player: player
  shieldCards: Card[]
  shieldCardGroups: CardGroup[]
  side: side
}>()
const emit = defineEmits<zoneEmit>()
const zone = 'shieldCards'
const groupZone = 'shieldCardGroups'

const countableShieldCards = computed(() => {
  // グループ化されているカードは一つとカウントする。
  const firstCardIds = props.shieldCardGroups.map((g) => g.cardIds[0]);
  return props.shieldCards.filter((c: Card) => {
    return !c.groupId || firstCardIds.includes(c.id);
  });
})
const {
  openWorkSpace,
  setHoveredCard,
  cardIsSelected,
  setMarkColor,
  selectTargetMode,
  selectMode,
  setSelectMode,
  moveSelectedCard,
} = useZone(props, emit)

function group(card: Card): CardGroup {
  const group = {
    ...props.shieldCardGroups.find((g: CardGroup) => g.id === card.groupId),
  };
  group.cards = props.shieldCards.filter((c: Card) => c.groupId === group.id);
  return group as CardGroup;
}

function clickShield(card: Card) {
  if (cardIsSelected(card)) {
    // 選択中のカードと同じカードがクリックされた場合、
    // セレクトモードを終了。
    setSelectMode(null);
    return;
  }
  if (selectTargetMode()) {
    if (selectMode.value?.player === props.player) {
      // カードを重ねる。
      // moveSelectedCardでselectModeがnullになるので、情報を残しておく。
      const fromCard = selectMode.value.card;
      moveSelectedCard(zone);
      emit("group-card", {
        from: zone,
        to: groupZone,
        fromCard: fromCard,
        toCard: card,
        player: props.player,
      });
    }
    return;
  }
  setSelectMode({
    card,
    zone: "shieldCards",
    player: props.player,
  });
}
</script>

<style lang="scss">
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
.shield-zone {
  background-color: rgb(79, 205, 255);
  width: 275px;
  height: cardHeight(50px) + 8px;
  display: flex;
  flex-direction: row-reverse;
  position: relative;
  overflow-x: scroll;
  margin-right: 8px;
  &::-webkit-scrollbar {
    // 下のスクロールバーの幅だけスクロール可能になっているので消す。
    width: 0px;
  }
  > * {
    margin-right: 2px;
  }
  &.upper {
    flex-direction: row;
    margin-left: 8px;
    .shield-card {
      transform: rotate(180deg);
    }
  }
  .shield {
    position: relative;
    &.is-selectMode {
      .card::before {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        border: 3px solid orange;
        position: absolute;
        top: 0;
      }
    }
    &.is-selected {
      .card::before {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        border: 3px solid #b60000;
        position: absolute;
        top: 0;
      }
    }
  }
  .shield-num {
    color: #fff;
    position: absolute;
    bottom: 3px;
    right: 5px;
    font-size: 10px;
  }
  .shield-reverse {
    display: block;
    width: 50px;
    height: cardHeight(50px);
  }
  .card_buttons {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0%);
  }
}
</style>
