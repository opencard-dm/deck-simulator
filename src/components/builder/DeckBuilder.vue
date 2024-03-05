<template>
  <div id="app">
    <div class="app-wrapper" @mousemove="traceMouseMove">
      <div class="content">
        <div class="deck-wrapper left">
          <DeckEditor :deckList="deckList"></DeckEditor>
        </div>
        <div v-if="!isPhone()" class="deck-wrapper right">
          <DeckEditor :deckList="deckList"></DeckEditor>
        </div>
      </div>

      <div
        id="display"
        :class="{ hidden: display.hidden, blur: display.blur }"
        :style="[display.left ? { left: '5px' } : { right: '5px' }]"
        v-if="display.imageUrl"
        @dragover="onDragOver"
      >
        <div class="card-image">
          <img :src="display.imageUrl" />
        </div>
      </div>
      <div id="message-box" v-if="message">
        <span>{{ message }}</span>
      </div>
      <div class="separator"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DeckEditor from "./DeckEditor.vue";
import { Deck, fetchDeck } from "@/helpers/Deck";
import systemDecks from '@/decks.json'
import { ref, reactive, computed } from 'vue'
import { useRoomStore } from "@/stores/room";
import { SourceDeck } from "@/entities/Deck";
import { useDecksStore } from "@/stores/decks";
import { isPhone } from "@/helpers/Util";

// data
const deckList = reactive({
  readyMade: [] as SourceDeck[],
  custom: [] as SourceDeck[],
})
const display = reactive({
  card: null,
  left: true,
  hidden: false,
  blur: false,
  imageUrl: "",
})
const preview = reactive({
  left: {
    src: "",
    input: null,
    file: null,
    files: null,
  },
  right: {
    src: "",
    input: null,
    file: null,
    files: null,
  },
})
const message = ref('')

const roomStore = useRoomStore()
const decksStore = useDecksStore();

// on created
(function () {
  message.value = "データを\n取得中です";
  const decks: SourceDeck[] = [];
  decksStore.data.forEach(source => {
    decks.push(...source.decks)
  })
  decks.push(...systemDecks as any[])
  deckList.custom = decks;
  fetchDeck(decks[0].name, roomStore)
  fetchDeck(decks[1].name, roomStore)
  message.value = "";
})();

// methods
function createDeck(params, side) {
  if (!params.name) return;
  const deck = {
    name: params.name,
    cards: [],
  };
  const decksCopy = this.$store.state.decks.data;
  decksCopy.push(deck);
  this.$store.commit("decks/setData", decksCopy);
  this[side]["deckData"] = deck;
}
function onDragOver() {
  event.preventDefault();
  this.display.imageUrl = null;
}
function onDragStart() {
  // event.preventDefault()
}
function traceMouseMove(event) {
  if (display.hidden) {
    return;
  }
  const imageSrc = event.target.src;
  if (!imageSrc) {
    display.imageUrl = "";
    return;
  }
  display.imageUrl = imageSrc;
  let mX = event.pageX;
  // let mY = event.pageY;
  if (mX < window.innerWidth / 2) {
    display.left = false;
  } else {
    display.left = true;
  }
}
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}

/* display */
#display {
  position: fixed;
  top: 10px;
  /* left: 10px; */
  z-index: 2;
}
.blur {
  opacity: 0.6;
}

#display:hover {
  opacity: 0.6;
}
#display .card-image img {
  width: 350px;
}
.separator {
  position: absolute;
  top: 0px;
  left: calc((100vw / 2) - 1px);
  height: calc(100vh - 2px);
  // border: 1px solid white;
  @media screen and (max-width: 800px) {
    & {
      left: 399px;
    }
  }
}
#message-box {
  position: absolute;
  width: 150px;
  padding: 10px;
  border-radius: 20px;
  background-color: aqua;
  top: 150px;
  left: calc((100vw / 2) - 85px);
  // border: 1px solid white;
  text-align: center;
  @media screen and (max-width: 800px) {
    & {
      left: 400px - 85px;
    }
  }
}
.tool-footer {
  $size: 60px;
  $half: 30px;
  position: absolute;
  left: calc((100vw / 2) - (30px));
  top: 81px;
  width: $size;
  height: calc($size / 2);
  border-top: 1px white solid;
  border-radius: 0 0 $size $size;
  background-color: blue;
  @media screen and (max-width: 800px) {
    & {
      left: (400px - ($half));
    }
  }
  &:hover {
    width: unset;
    height: unset;
    border-radius: unset;
    div.hidden {
      display: block;
      color: white;
    }
    .click {
      cursor: pointer;
      &:hover {
        cursor: pointer;
        color: lightgray;
      }
    }
  }
}
body {
  min-width: 800px;
}
.content {
  display: flex;
  padding-top: 60px;
}
.deck-wrapper {
  background-color: lightgray;
  &.left {
    border-right: 2px white solid;
  }
}
</style>