<template>
  <div
    id="app"
    style="background-color: lightgray"
  >
    <CHeader
      :single="single"
      :game="game"
      :game-logger="gameLogger"
      :current-player="currentPlayer"
      @switch-tab="switchTab()"
      @reset-game="onResetGame"
    />

    <DeckSelector
      v-if="deckSelectorActiveWatch"
      v-model:active="deckSelectorActive"
      :player="currentPlayer"
      :is-ready="players[currentPlayer].isReady()"
      :partner-is-ready="true"
      :card-actions="cardActions"
      @move-cards="onMoveCards"
      @selected="onDeckSelected"
    />

    <PlayerTabs
      :tab="tabId"
      @switch-tab="switchTab()"
    >
      <template #lower-player>
        <ImageViewer>
          <WorkSpace
            :lower-player="lowerPlayer"
            :single="single"
            @move-cards="onMoveCards"
            @shuffle-cards="shuffleCards"
            @emit-room-state="emitRoomState"
          />

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
                :game-logger="gameLogger"
                :player="lowerPlayer"
                :upper-player="upperPlayer"
                @start-turn="onStartTurn({ player: lowerPlayer })"
                @open-logs="logsViewer = true"
              />
            </div>
            <PlaySheet
              :side="'lower'"
              :player="lowerPlayer"
              :lower-player="lowerPlayer"
              :name="players[lowerPlayer].name"
              :single="single"
              :started="started"
              :game="game"
              :game-logger="gameLogger"
              :card-actions="cardActions"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
              @start-game="onStartGame"
            />
          </div>
        </ImageViewer>
      </template>
      <template
        v-if="true"
        #upper-player
      >
        <ImageViewer :hide="!isPhone()">
          <WorkSpace
            v-if="isPhone()"
            :lower-player="upperPlayer"
            :single="single"
            @move-cards="onMoveCards"
            @shuffle-cards="shuffleCards"
            @emit-room-state="emitRoomState"
          />

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
                :game-logger="gameLogger"
                :player="upperPlayer"
                :upper-player="upperPlayer"
                @start-turn="onStartTurn({ player: upperPlayer })"
                @open-logs="logsViewer = true"
                @select-deck="() => {
                  currentPlayer = upperPlayer
                  deckSelectorActive = true
                }"
              />
            </div>
            <PlaySheet
              v-if="players[upperPlayer].isReady()"
              :side="'lower'"
              :player="upperPlayer"
              :lower-player="lowerPlayer"
              :name="players[upperPlayer].name"
              :single="single"
              :started="started"
              :game="game"
              :game-logger="gameLogger"
              :card-actions="cardActions"
              @move-cards="onMoveCards"
              @group-card="onGroupCard"
              @emit-room-state="emitRoomState"
              @change-cards-state="onChangeCardsState"
            />
          </div>
        </ImageViewer>
      </template>
    </PlayerTabs>
    <o-modal
      v-model:active="logsViewer"
      root-class="gameLoggerModal"
      content-class="gameLoggerModal__content"
    >
      <LogsViewer :game-logger="gameLogger" />
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
import { RoomConfig, useRoomSetup } from '@/helpers/room';
import { Deck } from '@/helpers/Deck';
import { SocketUtil } from '../helpers/socket';
import { PlayerType } from "@@/core/entities/player";
import { Card } from '@@/core/entities/card';
import { ZoneType } from '@@/core/entities/zones';
import { RoomProps } from '.';
import { Deck as DeckType, SourceDeck } from '@@/core/entities/Deck';
import { useRoomStore } from '@/stores/room';
import { updateRoom } from '@@/core/services/room.service';

const store = useRoomStore()

const props = defineProps<RoomProps>()
const players = props.game.players

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
  if (!players[currentPlayer.value].isReady()) {
    if (players[currentPlayer.value].yamafudaZone.cards.length > 0) {
      // players[currentPlayer.value].isReady() = true
      return
    }
    deckSelectorActive.value = true;
  }
}

const deckSelectorActive = ref(false);
const deckSelectorActiveWatch = computed<boolean>({
  get() {
    if (players[currentPlayer.value].yamafudaZone.cards.length > 0) {
      // players[currentPlayer.value].isReady = true
      return false
    }
    if (players[currentPlayer.value].isReady()) {
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
  if (!players[currentPlayer.value].isReady()) {
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
  resetGame,
} = useRoomSetup(props);

// Turns
const totalTurns = computed(() => {
  return players['a'].turn.total + players['b'].turn.total
})
const started = computed(() => totalTurns.value > 0)
function onStartGame(player: PlayerType, first: boolean) {
  // 先攻後攻を選べるのはlowerPlayerだけとして、
  // 送られてきたplayerを使わない
  if (first) {
    onStartTurn({ player: props.lowerPlayer })
  } else {
    onStartTurn({ player: props.upperPlayer })
  }
}

async function onResetGame(keepDecks = false) {
  await resetGame(keepDecks);
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

function shuffleCards(from: ZoneType, cards: Card[], player: PlayerType) {
  players[player].getZone(from).cards = Deck.shuffle(cards);
  players[player].getZone(from).cards.forEach(c => {
    c.showInWorkSpace = false
  })
  const shuffleMessage = {
    shieldCards: 'シールド',
    yamafudaCards: '山札',
    tefudaCards: '手札',
  };
  // setMessage(shuffleMessage[from] + 'をシャッフル', player);
}

async function onDeckSelected({ deck, sourceDeck, player }: {
  deck: DeckType,
  sourceDeck: SourceDeck,
  player: PlayerType
}) {
  if (props.single && currentPlayer.value === 'b') {
    players.b.deck = sourceDeck
  }
  if (RoomConfig.useFirebase) {
    if (player === 'a') {
      await updateRoom({
        roomId: props.roomId,
        deckA: sourceDeck,
      })
    }
    if (player === 'b') {
      await updateRoom({
        roomId: props.roomId,
        deckB: sourceDeck,
      })
    }
  }
  onSelectDeck(currentPlayer.value, deck)
}
</script>
