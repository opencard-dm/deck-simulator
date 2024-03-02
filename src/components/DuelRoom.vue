<template>
  <div id="app" style="background-color: lightgray">
    <CHeader :single="single"
      :gameLogger="gameLogger"
      :currentPlayer="currentPlayer"
      :deck="sourceDeck"
      @switch-tab="switchTab()"
      @reset-game="onResetGame()"
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
            :single="single"
            @move-cards="onMoveCards"
            @shuffle-cards="shuffleCards"
            @emit-room-state="emitRoomState"
          ></WorkSpace>

          <div
            id="js_gameBoard"
            class="gameBoard"
            :style="{
              opacity: store.workSpace.active ? 0.3 : 1,
              height: playerZoneHeight,
            }"
          >
            <div class="gameBoard_topButtons">
              <TurnButtons
                :players="players"
                :gameLogger="gameLogger"
                :player="lowerPlayer"
                @start-turn="onStartTurn({ player: lowerPlayer })"
                @open-logs="logsViewer = true"
              ></TurnButtons>
            </div>
            <PlaySheet
              :side="'lower'"
              :player="lowerPlayer"
              :cards="players[lowerPlayer].cards"
              :name="players[lowerPlayer].name"
              :roomId="players[lowerPlayer].roomId"
              :isReady="players[lowerPlayer].isReady"
              :hasChojigen="players[lowerPlayer].hasChojigen"
              :single="single"
              :started="started"
              :gameLogger="gameLogger"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
              @start-game="onStartGame"
            ></PlaySheet>
          </div>
        </ImageViewer>
      </template>
      <template v-if="true" #upper-player>
        <ImageViewer :hide="!isPhone()">
          <WorkSpace
            v-if="isPhone()"
            :lowerPlayer="upperPlayer"
            :single="single"
            @move-cards="onMoveCards"
            @shuffle-cards="shuffleCards"
            @emit-room-state="emitRoomState"
          ></WorkSpace>

          <div
            id="js_gameBoard"
            class="gameBoard"
            :style="{
              opacity: store.workSpace.active ? 0.3 : 1,
              height: single ? playerZoneHeight : `${Layout.upperPlayerZoneHeight()}px`,
            }"
          >
            <div class="gameBoard_topButtons">
              <TurnButtons
                :players="players"
                :gameLogger="gameLogger"
                :player="upperPlayer"
                @start-turn="onStartTurn({ player: upperPlayer })"
                @open-logs="logsViewer = true"
                @select-deck="() => {
                  currentPlayer = upperPlayer
                  deckSelectorActive = true
                }"
              ></TurnButtons>
            </div>
            <PlaySheet
              v-if="players[upperPlayer].isReady"
              :side="single && isPhone() ? 'lower' : 'upper'"
              :player="upperPlayer"
              :cards="players[upperPlayer].cards"
              :name="players[upperPlayer].name"
              :roomId="players[upperPlayer].roomId"
              :isReady="players[upperPlayer].isReady"
              :hasChojigen="players[upperPlayer].hasChojigen"
              :single="single"
              :started="started"
              :gameLogger="gameLogger"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
            ></PlaySheet>
          </div>
        </ImageViewer>
      </template>
    </PlayerTabs>
    <o-modal
      rootClass="gameLoggerModal"
      v-model:active="logsViewer"
      contentClass="gameLoggerModal__content"
    >
      <LogsViewer :game-logger="gameLogger"></LogsViewer>
    </o-modal>
  </div>
</template>

<script setup lang="ts">
import { Layout } from '@/helpers/layout';
import { isPhone } from '@/helpers/Util';
import { computed, onMounted, ref } from 'vue';
import CHeader from './CHeader.vue';
import WorkSpace from './WorkSpace.vue';
import ImageViewer from './ImageViewer.vue';
import TurnButtons from './TurnButtons.vue';
import DeckSelector from './DeckSelector.vue';
import PlaySheet from './PlaySheet.vue';
import PlayerTabs from './PlayerTabs.vue';
import LogsViewer from './LogsViewer.vue';
import { useRoomSetup } from '@/helpers/room';
import { Deck } from '@/helpers/Deck';
import { SocketUtil } from '../helpers/socket';
import { player, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { RoomProps } from '.';
import { Deck as DeckType, SourceDeck } from '@/entities/Deck';
import { useRoomStore } from '@/stores/room';

const store = useRoomStore()

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

const logsViewer = ref(false)

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
  onStartTurn,
  players,
  resetGame,
} = useRoomSetup(props);

// Turns
const totalTurns = computed(() => {
  return players['a'].turn.total + players['b'].turn.total
})
const started = computed(() => totalTurns.value > 0)
function onStartGame(player: player, first: boolean) {
  // 先攻後攻を選べるのはlowerPlayerだけとして、
  // 送られてきたplayerを使わない
  if (first) {
    onStartTurn({ player: props.lowerPlayer })
  } else {
    onStartTurn({ player: props.upperPlayer })
    onStartTurn({ player: props.lowerPlayer })
  }
}

function onResetGame() {
  resetGame();
  tabId.value = 1
  deckSelectorActive.value = true
}

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

function onDeckSelected({ deck, sourceDeck }: {
  deck: DeckType,
  sourceDeck: SourceDeck,
}) {
  onSelectDeck(currentPlayer.value, deck)
}

function setMessage() {
  //
}
</script>
