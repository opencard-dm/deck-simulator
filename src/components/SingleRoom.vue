<template>
  <div id="app" style="background-color: lightgray" v-if="isMounted">
    <CHeader :single="single"
      :gameLogger="gameLogger"
      :currentPlayer="currentPlayer"
      @switch-tab="switchTab()"
    ></CHeader>

    <div
      v-if="isPhone()"
      class="circleTab"
      :class="{
        circleTab_left: tabId === 2,
        circleTab_right: tabId === 1,
      }"
      @click="switchTab"
    ></div>

    <div class="app-wrapper main tab1" :class="{ active: tabId === 1 }">
      <ImageViewer>
        <WorkSpace
          :lowerPlayer="lowerPlayer"
          @move-cards="onMoveCards"
          @shuffle-cards="shuffleCards"
          @emit-room-state="emitRoomState"
        ></WorkSpace>

        <div
          id="js_gameBoard"
          class="gameBoard"
          :style="{
            opacity: store.state.workSpace.active ? 0.3 : 1,
            height: playerZoneHeight,
          }"
        >
          <PlayerLower
            :player="lowerPlayer"
            :cards="players[lowerPlayer].cards"
            :name="players[lowerPlayer].name"
            :roomId="players[lowerPlayer].roomId"
            :isReady="players[lowerPlayer].isReady"
            :hasChojigen="players[lowerPlayer].hasChojigen"
            @move-cards="onMoveCards"
            @group-card="groupCard"
            @emit-room-state="emitRoomState"
            @change-cards-state="onChangeCardsState"
          ></PlayerLower>
        </div>
      </ImageViewer>
    </div>
    <div
      v-if="isPhone()"
      class="app-wrapper main tab2"
      :class="{ active: tabId === 2 }"
    >
      <ImageViewer>
        <DeckSelector
          v-if="!players[upperPlayer].isReady"
          v-model:active="deckSelectorActive"
          :player="upperPlayer"
          :isReady="players[upperPlayer].isReady"
          :partnerIsReady="true"
          :cancelable="true"
          @moveCards="onMoveCards"
          @selected="onDeckSelected"
        ></DeckSelector>

        <WorkSpace
          :lowerPlayer="upperPlayer"
          @move-cards="onMoveCards"
          @shuffle-cards="shuffleCards"
          @emit-room-state="emitRoomState"
        ></WorkSpace>

        <div
          id="js_gameBoard"
          class="gameBoard"
          :style="{
            opacity: store.state.workSpace.active ? 0.3 : 1,
            height: playerZoneHeight,
          }"
        >
          <PlayerLower
            :player="upperPlayer"
            :cards="players[upperPlayer].cards"
            :name="players[upperPlayer].name"
            :roomId="players[upperPlayer].roomId"
            :isReady="players[upperPlayer].isReady"
            :hasChojigen="players[upperPlayer].hasChojigen"
            @move-cards="onMoveCards"
            @group-card="groupCard"
            @emit-room-state="emitRoomState"
            @change-cards-state="onChangeCardsState"
          ></PlayerLower>
        </div>
      </ImageViewer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layout } from '@/helpers/layout';
import { isPhone } from '@/helpers/Util';
import { onMounted, ref, watch } from 'vue';
import CHeader from './CHeader.vue';
import WorkSpace from './WorkSpace.vue';
import ImageViewer from './ImageViewer.vue';
import DeckSelector from './DeckSelector.vue';
import PlayerLower from './PlayerLower.vue';
import { useRoomSetup } from '@/helpers/room';
import { Deck } from '@/helpers/Deck';
import { SocketUtil } from '../helpers/socket';
import { player, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { useStore } from 'vuex';
import { GameLogger } from '@/helpers/GameLogger';

const store = useStore()

const props = defineProps<{
  upperPlayer: player,
  lowerPlayer: player,
  room: Object,
  loading: boolean,
  deck: Object | null,
  single: boolean,
  gameLogger: GameLogger,
}>()

const tabId = ref(1);
const currentPlayer = ref(props.lowerPlayer)

function switchTab() {
  if (tabId.value === 1) {
    if (!players.b.isReady) {
      deckSelectorActive.value = true;
    }
    tabId.value = 2;
    currentPlayer.value = props.upperPlayer
  } else {
    tabId.value = 1;
    currentPlayer.value = props.lowerPlayer
  }
}

const deckSelectorActive = ref(true);

const playerZoneHeight = isPhone() ? `${Layout.playerZoneHeight(70)}px` : '';
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const {
  moveCards,
  onMoveCards,
  groupCard,
  setRoomState,
  players,
  changeCardsState,
  onChangeCardsState,
  cardActions
} = useRoomSetup(props);

defineExpose({
  moveCards,
  groupCard,
  changeCardsState,
  cardActions,
})

watch(
  () => props.loading,
  (newVal) => {
    if (newVal === false) {
      setRoomState();
    }
  }
);

function emitRoomState() {
  if (SocketUtil.socket) {
    // 今のところバトルゾーンとマナゾーンのタップ状態を送信するために使用。
    SocketUtil.socket.emit('cards-moved', players[props.lowerPlayer]);
    // SocketUtil.socket.emit("cards-moved", this.players[this.upperPlayer])
  }
}

function shuffleCards(from: zone, cards: Card[], player: player) {
  players[player]['cards'][from] = Deck.shuffle(cards);
  const shuffleMessage = {
    shieldCards: 'シールド',
    yamafudaCards: '山札',
    tefudaCards: '手札',
  };
  // setMessage(shuffleMessage[from] + 'をシャッフル', player);
}

function onDeckSelected() {
  players.b.isReady = true;
}

function setMessage() {
  //
}
</script>

<style lang="scss" scoped>
.circleTab {
  width: 50px;
  height: 50px;
  background: #005c98;
  position: absolute;
  @media screen and (max-device-width: 800px) {
    position: fixed;
  }
  top: 50px;
  z-index: 1;
  border-radius: 50%;
  transition: transform ease-in 0.3s;
}
.circleTab_left {
  left: 0px;
  transform: translateX(-50%);
}
.circleTab_right {
  right: 0px;
  transform: translateX(50%);
}
.app-wrapper {
  @media screen and (max-device-width: 800px) {
    display: none;
    opacity: 0;
    transition: all 1s;
    &.active {
      display: initial;
      opacity: 1;
    }
  }
}
</style>
