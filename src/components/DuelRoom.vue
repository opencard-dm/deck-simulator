<template>
  <div id="app" style="background-color: lightgray" v-if="isMounted">
    <CHeader :single="single"
      :gameLogger="gameLogger"
      :currentPlayer="currentPlayer"
      @switch-tab="switchTab()"
    ></CHeader>

    <DeckSelector
      v-if="!players[currentPlayer].isReady"
      v-model:active="deckSelectorActive"
      :player="currentPlayer"
      :isReady="players[currentPlayer].isReady"
      :partnerIsReady="true"
      :cancelable="true"
      :cardActions="cardActions"
      @moveCards="onMoveCards"
      @selected="onDeckSelected"
    ></DeckSelector>

    <PlayerTabs :tab="tabId" @switch-tab="switchTab()">
      <template #lower-player>
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
            <PlaySheet
              :side="'lower'"
              :player="lowerPlayer"
              :cards="players[lowerPlayer].cards"
              :name="players[lowerPlayer].name"
              :roomId="players[lowerPlayer].roomId"
              :isReady="players[lowerPlayer].isReady"
              :hasChojigen="players[lowerPlayer].hasChojigen"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
            ></PlaySheet>
          </div>
        </ImageViewer>
      </template>
      <template #upper-player>
        <ImageViewer>
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
              height: single ? playerZoneHeight : `${Layout.upperPlayerZoneHeight()}px`,
            }"
          >
            <PlaySheet
              :side="single ? 'lower' : 'upper'"
              :player="upperPlayer"
              :cards="players[upperPlayer].cards"
              :name="players[upperPlayer].name"
              :roomId="players[upperPlayer].roomId"
              :isReady="players[upperPlayer].isReady"
              :hasChojigen="players[upperPlayer].hasChojigen"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
            ></PlaySheet>
          </div>
        </ImageViewer>
      </template>
    </PlayerTabs>
  </div>
</template>

<script setup lang="ts">
import { Layout } from '@/helpers/layout';
import { isPhone } from '@/helpers/Util';
import { computed, onMounted, ref, watch } from 'vue';
import CHeader from './CHeader.vue';
import WorkSpace from './WorkSpace.vue';
import ImageViewer from './ImageViewer.vue';
import DeckSelector from './DeckSelector.vue';
import PlaySheet from './PlaySheet.vue';
import PlayerTabs from './PlayerTabs.vue';
import { useRoomSetup } from '@/helpers/room';
import { Deck } from '@/helpers/Deck';
import { SocketUtil } from '../helpers/socket';
import { player, playerCards, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { useStore } from 'vuex';
import { RoomProps } from '.';

const store = useStore()

const props = defineProps<RoomProps>()

const tabId = ref(1);
const currentPlayer = computed(() => {
  return tabId.value === 1 ? props.lowerPlayer
    : props.upperPlayer
})

function switchTab() {
  if (!players[currentPlayer.value].isReady) {
    deckSelectorActive.value = true;
}
  if (tabId.value === 1) {
    tabId.value = 2;
  } else {
    tabId.value = 1;
  }
}

const deckSelectorActive = ref(false);

const playerZoneHeight = isPhone() ? `${Layout.playerZoneHeight(70)}px` : '';
const isMounted = ref(false);
onMounted(() => {
  if (!players[currentPlayer.value].isReady) {
    deckSelectorActive.value = true
  }
  isMounted.value = true;
});

const {
  onMoveCards,
  onGroupCard,
  onChangeCardsState,
  setRoomState,
  players,
  cardActions,
  gameLogger,
} = useRoomSetup(props);

defineExpose({
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

function onDeckSelected({ playerCards }: {
  playerCards: playerCards
}) {
  players[currentPlayer.value].isReady = true;
  players[currentPlayer.value].cards = playerCards
}

function setMessage() {
  //
}
</script>
