<template>
  <div id="app">
    <div class="app-wrapper"
      @mousemove="isPhone() ? null : traceMouseMove($event)"
      @click.stop="isPhone() ? roomStore.setHoveredCard(null) : null"
    >
      <div class="content" v-if="!loading">
        <div class="deck-wrapper left">
          <DeckEditor
            :deckList="deckList"
            :isMain="true"
            @delete-deck="onDeleteDeck"
          ></DeckEditor>
        </div>
        <div v-if="!isPhone()" class="deck-wrapper right">
          <DeckEditor
            :deckList="deckList"
            :isMain="false"
            @delete-deck="onDeleteDeck"
          ></DeckEditor>
        </div>
      </div>

      <div
        id="display"
        :style="[display.left ? { left: '5px' } : { left: `${center}px` }]"
        v-if="hoveredCard"
      >
        <div>
          <TextCard
            @click.stop="roomStore.setHoveredCard(null)"
            :card="hoveredCard"
            :width="300"
            :large="true"
            :selected="false"
          ></TextCard>
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
import TextCard from "@/components/elements/TextCard.vue";
import { fetchCardDetails } from "@@/core/services/card.service";
import systemDecks from '@/decks.json'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoomStore } from "@/stores/room";
import { SourceDeck } from "@/entities/Deck";
import { isPhone } from "@/helpers/Util";
import { getUserDecks } from "./decks";

// data
const deckList = reactive<SourceDeck[]>([])
const loading = ref(true)
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

const roomStore = useRoomStore();

onMounted(async function () {
  message.value = "データを\n取得中です";
  // TODO: ログイン後のデータを取得するために、
  // 500ms待っているがより良い方法にしたい
  setTimeout(async () => {
    const userDecks = await getUserDecks()
    deckList.push(...userDecks)
    deckList.push(...systemDecks as any[])
    loading.value = false

    roomStore.addCardDetails(await fetchCardDetails(deckList[0]))
    roomStore.addCardDetails(await fetchCardDetails(deckList[1]))
    message.value = "";
  }, 500)
})

// hovered card
const hoveredCard = computed(() => roomStore.hoveredCard)
const center = computed(() => {
  if (!window) return 5
  return window.innerWidth / 2
})
function traceMouseMove(event: MouseEvent) {
  let mX = event.pageX;
  // let mY = event.pageY;
  if (mX < window.innerWidth / 2) {
    display.left = false;
  } else {
    display.left = true;
  }
}
function onDeleteDeck(deckId: string) {
  const deckIndex = deckList.findIndex(d => d.id === deckId)
  if (deckIndex !== -1) {
    deckList.splice(deckIndex, 1)
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
  top: 64px;
  /* left: 10px; */
  z-index: 2;
}
.blur {
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
  width: 100%;
  min-height: calc(100vh - 60px);
  &.left {
    border-right: 2px white solid;
  }
}
</style>