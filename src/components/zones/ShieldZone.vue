<template>
  <div class="shield-zone" :class="side">
    <div
      v-for="(card, index) in visibleCards"
      :key="index"
      class="shield"
      :class="{
        'is-selectMode': canPileUp(),
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
            v-if="card.groupId"
            class="shield-num"
          >
            {{ getGroup(card)?.cards.length }}
          </div>
        </div>
        <div v-if="cardIsSelected(card)" class="card_buttons">
          <o-button
            variant="grey-dark"
            size="small"
            @click.stop="
              openWorkSpace({
                zone: zone,
                cards: card.groupId ? getGroup(card)?.cards : [card],
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
import type { groupableZone, player, side } from "@/entities";
import { Card } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";
import { useCardGroups } from "./cardGroups";

const props = withDefaults(defineProps<{
  player: player
  cards: Card[]
  side: side
  zone?: groupableZone
}>(), {
  zone: 'shieldCards',
})
const emit = defineEmits<zoneEmit>()

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

const {
  visibleCards,
  getGroup,
} = useCardGroups(props)

function canPileUp() {
  return selectTargetMode() && !selectMode.value?.card.groupId
}

function clickShield(card: Card) {
  if (cardIsSelected(card)) {
    // 選択中のカードと同じカードがクリックされた場合、
    // セレクトモードを終了。
    setSelectMode(null);
    return;
  }
  if (canPileUp()) {
    if (selectMode.value?.player === props.player) {
      // カードを重ねる。
      const fromCard = selectMode.value?.card;
      const from = selectMode.value.zone
      setSelectMode(null)
      moveSelectedCard(props.zone);
      emit("group-card", {
        from,
        to: props.zone,
        fromCard: fromCard,
        toCard: card,
        player: props.player,
      });
    }
    return;
  }
  setSelectMode({
    card,
    zone: props.zone,
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
