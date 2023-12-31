<template>
  <div id="app" style="background-color: lightgray">
    <CHeader :single="single"
      :gameLogger="gameLogger"
      :currentPlayer="currentPlayer"
      @switch-tab="switchTab()"
      @reset-game="resetGame()"
    ></CHeader>

    <DeckSelector
      v-if="deckSelectorActiveWatch"
      v-model:active="deckSelectorActive"
      :player="currentPlayer"
      :isReady="players[currentPlayer].isReady"
      :partnerIsReady="true"
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
            <div v-if="!isPhone() && !players[upperPlayer].isReady"
              style="float: right;">
              <o-button
                variant="grey-dark"
                size="small"
                @click="() => {
                  currentPlayer = upperPlayer;
                  deckSelectorActive = true;
                }"
              >相手のデッキを選択する</o-button>
            </div>
            <PlaySheet
              v-if="!isPhone() && players[upperPlayer].isReady"
              :side="'upper'"
              :player="upperPlayer"
              :cards="players[upperPlayer].cards"
              :name="players[upperPlayer].name"
              :roomId="players[upperPlayer].roomId"
              :isReady="players[upperPlayer].isReady"
              :hasChojigen="players[upperPlayer].hasChojigen"
              :single="single"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
            ></PlaySheet>
            <PlaySheet
              :side="'lower'"
              :player="lowerPlayer"
              :cards="players[lowerPlayer].cards"
              :name="players[lowerPlayer].name"
              :roomId="players[lowerPlayer].roomId"
              :isReady="players[lowerPlayer].isReady"
              :hasChojigen="players[lowerPlayer].hasChojigen"
              :single="single"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
            ></PlaySheet>
          </div>
        </ImageViewer>
      </template>
      <template v-if="isPhone()" #upper-player>
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
              :single="single"
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
import { Deck as DeckType } from '@/entities/Deck';

const store = useStore()

const props = defineProps<RoomProps>()

const tabId = ref(1);
const currentPlayer = computed({
  get() {
    return tabId.value === 1 ? props.lowerPlayer
      : props.upperPlayer
  },
  set(value) {
    if (value === props.lowerPlayer) {
      tabId.value = 1
    } else {
      tabId.value = 2
    }
  }
})

function switchTab() {
  if (tabId.value === 1) {
    tabId.value = 2;
  } else {
    tabId.value = 1;
  }
  // NOTE: tabIdの変更後に記述する必要がある
  if (!players[currentPlayer.value].isReady) {
    if (players[currentPlayer.value].cards.yamafudaCards.length > 0) {
      players[currentPlayer.value].isReady = true
      return
    }
    deckSelectorActive.value = true;
  }
}

const deckSelectorActive = ref(false);
const deckSelectorActiveWatch = computed<boolean>({
  get() {
    if (players[currentPlayer.value].cards.yamafudaCards.length > 0) {
      players[currentPlayer.value].isReady = true
      return false
    }
    if (players[currentPlayer.value].isReady) {
      return false
    }
    return true
  },
  set(value) {
    deckSelectorActive.value = value
  }
})

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
  onSelectDeck,
  players,
  resetGame,
} = useRoomSetup(props);

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

function onDeckSelected({ deck }: {
  deck: DeckType
}) {
  onSelectDeck(currentPlayer.value, deck)
}

function setMessage() {
  //
}
</script>
