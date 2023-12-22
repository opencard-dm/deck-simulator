<template>
  <div class="player-zone-wrapper">
    <div class="player-zone" :class="side">
      <div class="player-counter" :class="side">
        <RoundButton :style="{background: 'blue', color: 'beige'}" @click.stop="clickShieldButton">
          <div v-if="hasSelectedCard()" :style="{fontSize: '10px'}">
            シールドへ
          </div>
          <template v-else>
            <div :style="{fontSize: '10px'}">シールド</div>
            <div :style="{fontSize: '16px'}">
              {{ countableShieldCards.length }}
            </div>
          </template>
        </RoundButton>
      </div>
      <div class="shield-wrapper" :class="side">
        <!-- シールドゾーン -->
        <slot name="shield-zone"></slot>
        <!-- デッキゾーン -->
        <slot name="deck-zone"></slot>
        <!-- 墓地 -->
        <template v-if="!isPhone()">
          <div class="bochi" @click.stop="clickBochi">
            <div
              v-if="selectMode && selectMode.player === player"
              class="bochi_text"
            >
              墓地へ
            </div>
            <img
              v-else-if="lastCard(bochiCards)"
              :src="lastCard(bochiCards)?.imageUrl"
              @mouseenter="setHoveredCard(lastCard(bochiCards))"
              @mouseleave="setHoveredCard(null)"
            />
          </div>
          <!-- 超次元ゾーン -->
          <slot name="chojigenZone"></slot>
        </template>
      </div>
    </div>
    <div v-if="isPhone()" class="player-zone-under">
      <div class="bochi" @click.stop="clickBochi">
        <div
          v-if="selectMode && selectMode.player === player"
          class="bochi_text"
        >
          墓地へ
        </div>
        <img
          v-else-if="lastCard(bochiCards)"
          :src="lastCard(bochiCards)?.imageUrl"
          @mouseenter="setHoveredCard(lastCard(bochiCards))"
          @mouseleave="setHoveredCard(null)"
        />
      </div>
      <!-- 超次元ゾーン -->
      <slot name="chojigenZone"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPhone } from "@/helpers/Util"
import { computed } from 'vue'
import type { player, side } from "@/entities";
import RoundButton from '../elements/RoundButton.vue'
import { Card, CardGroup } from "@/entities/Card";
import { useZone, zoneEmit } from "@/helpers/zone";

const props = defineProps<{
  player: player
  bochiCards: Card[]
  shieldCardGroups: CardGroup[]
  shieldCards: Card[]
  side: side
}>()

const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
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
} = useZone(props, emit)

const countableShieldCards = computed(() => {
  // グループ化されているカードは一つとカウントする。
  const firstCardIds = props.shieldCardGroups.map((g) => g.cardIds[0]);
  return props.shieldCards.filter((c) => {
    return !c.groupId || firstCardIds.includes(c.id);
  });
})

function lastCard(cards: Card[]) {
  const length = cards.length;
  if (length && 0 < length) {
    return cards[length - 1];
  }
  return null;
}
function clickBochi() {
  if (!selectMode) {
    openWorkSpace({
      zone: "bochiCards",
      cards: props.bochiCards,
      player: props.player,
    });
    return;
  }
  moveSelectedCard("bochiCards");
}
function clickShieldButton() {
  if (hasSelectedCard() && selectMode.value) {
    selectMode.value.card.faceDown = true;
    moveSelectedCard("shieldCards");
    return;
  }
  openWorkSpace({
    zone: "shieldCards",
    cards: props.shieldCards,
    player: props.player,
  });
}
</script>

<script lang="ts">
export default {
  computed: {
  },
  methods: {
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/mixin.scss";
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 50px;
.player-zone-wrapper {
  .player-zone {
    // background-color: blue;
    display: flex;
    width: 430px;
    > * {
      align-self: center;
    }
    margin-left: 20px;
    @media screen and (max-device-width: 800px) {
      margin-left: 5px;
      width: 100%;
    }
    &.upper {
      margin-top: 20px;
    }
    &.lower {
      margin-top: 10px;
    }
  }
  .shield-wrapper {
    margin-left: 10px;
    display: flex;
    align-items: center;
    width: 430px;
    @media screen and (max-device-width: 800px) {
      // シールドボタン50px マージン15px
      width: calc(100% - 75px);
    }
    &.upper {
      flex-direction: row-reverse;
      .bochi {
        margin-right: 5px;
        transform: rotate(180deg);
      }
      .bochi_text {
        transform: rotate(180deg);
      }
    }
    &.lower {
      .bochi {
        margin-left: 5px;
      }
    }
    > * {
      align-self: center;
    }
  }
  img {
    width: 50px;
  }
  .bochi {
    position: relative;
    text-align: center;
    width: 60px;
    height: cardHeight(50px);
    background-color: purple;
    background-size: cover;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: lightgray;
    .bochi_text {
      text-align: center;
    }
    @media screen and (max-device-width: 800px) {
        width: 50px;
        img {
          border-top: 1px solid purple;
          border-bottom: 1px solid purple;
          border-left: 2px solid purple;
          border-right: 2px solid purple;
        }
    }
  }
  @media screen and (max-device-width: 800px) {
    .player-zone-under {
      width: fit-content;
      float: right;
      // margin-left: auto;
      margin-top: 10px;
      margin-right: 10px;
      display: flex;
    }
  }
}
</style>
