<template>
  <div id="app" style="background-color: lightgray" v-if="isMounted">
    <CHeader @reset-game="resetGame" :single="single"></CHeader>
    <div class="app-wrapper main">
      <ImageViewer>
        <WorkSpace
          :lowerPlayer="lowerPlayer"
          @move-cards="moveCards"
          @shuffle-cards="shuffleCards"
          @emit-room-state="emitRoomState"
        ></WorkSpace>

        <DeckSelector
          v-if="!loading && !single"
          v-model:active="deckSelectorActive"
          :player="lowerPlayer"
          :isReady="players[lowerPlayer].isReady"
          :partnerIsReady="players[upperPlayer].isReady"
          @moveCards="moveCards"
          @selected="onDeckSelected"
        ></DeckSelector>

        <div
          id="js_gameBoard"
          class="gameBoard"
          :style="{
            opacity: $store.state.workSpace.active ? 0.3 : 1,
            height: playerZoneHeight,
          }"
        >
          <template v-if="!single && !isPhone()">
            <PlaySheet
              :side="'upper'"
              :player="upperPlayer"
              :cards="players[upperPlayer].cards"
              :name="players[upperPlayer].name"
              :roomId="players[upperPlayer].roomId"
              :isReady="players[upperPlayer].isReady"
              :hasChojigen="players[upperPlayer].hasChojigen"
              @move-cards="moveCards"
              @group-card="groupCard"
              @emit-room-state="emitRoomState"
            ></PlaySheet>
          </template>

          <!-- <MessageBox :upper-player="upperPlayer"
            :lower-player="lowerPlayer"
          ></MessageBox>-->

          <!-- center -->
          <!-- <MessageButtons :player="lowerPlayer"></MessageButtons> -->
          <PlaySheet
            :side="'lower'"
            :player="lowerPlayer"
            :cards="players[lowerPlayer].cards"
            :name="players[lowerPlayer].name"
            :roomId="players[lowerPlayer].roomId"
            :isReady="players[lowerPlayer].isReady"
            :hasChojigen="players[lowerPlayer].hasChojigen"
            @move-cards="moveCards"
            @group-card="groupCard"
            @emit-room-state="emitRoomState"
          ></PlaySheet>
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
import PlaySheet from './PlaySheet.vue';
import { useRoomSetup } from '@/helpers/room';
import { Deck } from '@/helpers/Deck';
import { SocketUtil } from '../helpers/socket';

const playerZoneHeight = isPhone() ? `${Layout.playerZoneHeight(70)}px` : false;
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const props = defineProps({
  upperPlayer: String,
  lowerPlayer: String,
  room: Object,
  loading: Boolean,
  deck: Object,
  single: Boolean,
});

const { moveCards, groupCard, setRoomState, players, changeCardsState } = useRoomSetup(props);

defineExpose({
  moveCards,
  groupCard,
  changeCardsState,
})

watch(
  () => props.loading,
  (newVal) => {
    if (newVal === false) {
      setRoomState();
    }
  }
);

function onDeckSelected({ deck, player }) {
  this.players[player].isReady = true;
  this.players[player].hasChojigen = !!deck.hasChojigen;
}

function emitRoomState() {
  if (SocketUtil.socket) {
    // 今のところバトルゾーンとマナゾーンのタップ状態を送信するために使用。
    SocketUtil.socket.emit('cards-moved', this.players[this.lowerPlayer]);
    // SocketUtil.socket.emit("cards-moved", this.players[this.upperPlayer])
  }
}

function shuffleCards(from, cards, player) {
  players[player]['cards'][from] = Deck.shuffle(cards);
  const shuffleMessage = {
    shieldCards: 'シールド',
    yamafudaCards: '山札',
    tefudaCards: '手札',
  };
  setMessage(shuffleMessage[from] + 'をシャッフル', player);
}

function setMessage() {
  //
}
</script>
