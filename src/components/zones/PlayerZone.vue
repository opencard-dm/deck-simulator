<template>
  <div class="player-zone-wrapper">
    <div class="player-zone" :class="side">
      <div class="player-counter" :class="side">
        <slot name="shield-button"></slot>
      </div>
      <div class="shield-wrapper" :class="side">
        <slot name="shield-zone"></slot>
        <slot name="deck-zone"></slot>
        <template v-if="!isPhone()">
          <slot name="bochi-zone"></slot>
          <slot name="chojigenZone"></slot>
        </template>
      </div>
    </div>
    <div v-if="isPhone()" class="player-zone-under">
      <slot name="bochi-zone"></slot>
      <slot name="chojigenZone"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPhone } from "@/helpers/Util"
import type { player, side } from "@/entities";

const props = defineProps<{
  player: player
  side: side
}>()

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
