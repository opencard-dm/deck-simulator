<template>
  <div id="app">
    <div class="app-wrapper" @mousemove="traceMouseMove">
      <header>
        <div class="select-bar left">
          <DeckHeader
            :deckData="left.deckData"
            :deckList="deckList"
            :deckIndex="left.deckIndex"
            :side="'left'"
            v-on:change-deck="changeDeck"
            v-on:update-deck="updateDeck"
            @deleteDeck="deleteDeck"
          ></DeckHeader>
        </div>
        <div class="select-bar right">
          <DeckHeader
            :deckData="right.deckData"
            :deckList="deckList"
            :deckIndex="right.deckIndex"
            :side="'right'"
            v-on:change-deck="changeDeck"
            v-on:update-deck="updateDeck"
            @deleteDeck="deleteDeck"
          ></DeckHeader>
        </div>
      </header>

      <div class="content">
        <div class="deck-wrapper left">
          <div id="deck1">
            <CardList
              :cards="left.deckData.cards"
              :deck="left.deckData"
              :side="'left'"
              @update:cards="left.deckData.cards = $event"
            ></CardList>
          </div>
        </div>

        <div class="deck-wrapper right">
          <div id="deck2">
            <CardList
              :cards="right.deckData.cards"
              :deck="right.deckData"
              :side="'right'"
              @update:cards="right.deckData.cards = $event"
            ></CardList>
          </div>
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
import DeckHeader from "./DeckHeader.vue";
import CardList from "./CardList.vue";
</script>
<script lang="ts">
import { Deck } from "@/helpers/Deck";
import systemDecks from '@/decks.json'

export default {
  data() {
    return {
      // apiで取得
      deckList: {
        readyMade: [],
        custom: [],
      },
      left: {
        deckIndex: 0,
        deckData: {
          cards: [],
        },
      },
      right: {
        deckIndex: 1,
        deckData: {
          cards: [],
        },
      },
      display: {
        card: null,
        left: true,
        hidden: false,
        blur: false,
        imageUrl: "",
      },
      preview: {
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
      },
      message: "",
    };
  },
  created() {
    this.message = "データを\n取得中です";
    const decks = [];
    this.$store.state.decks.data.forEach(source => {
      decks.push(...source.decks)
    })
    decks.push(...systemDecks)
    this.deckList.custom = decks;
    if (decks[0]) {
      this.left.deckData = Deck.formatData(decks[0]);
    }
    if (decks[1]) {
      this.right.deckData = Deck.formatData(decks[1]);
    }
    this.message = "";
  },
  methods: {
    updateDeck(params, side) {
      this.message = "変更を\n保存中です";
      // 名前を変更
      if (params.name) {
        this[side].deckData.name = params.name;
      }
      // カードを追加
      if (params.cardUrl) {
        this[side].deckData.cards.push({
          imageUrl: params.cardUrl,
          time: 0,
        });
      }
      const decksCopy = this.$store.state.decks.data;
      decksCopy[this[side].deckIndex] = this[side].deckData;
      this.$store.commit("decks/setData", decksCopy);
      this.message = "";
    },
    createDeck(params, side) {
      if (!params.name) return;
      const deck = {
        name: params.name,
        cards: [],
      };
      const decksCopy = this.$store.state.decks.data;
      decksCopy.push(deck);
      this.$store.commit("decks/setData", decksCopy);
      this[side]["deckData"] = deck;
    },
    changeDeck(deckType, index, side) {
      if (deckType === "custom") {
        this[side]["deckData"] = Deck.formatData(
          this.deckList["custom"][index],
          this.useConfig().IMAGE_HOST
        );
        this[side].deckIndex = index;
      }
    },
    deleteDeck(side) {
      const decksCopy = this.$store.state.decks.data;
      decksCopy.splice(this[side].deckIndex, 1);
      this.$store.commit("decks/setData", decksCopy);
      this.message = "";
      location.reload();
    },
    totalNum(cards) {
      let result = 0;
      for (let card of cards) {
        result += card.time;
      }
      return result;
    },
    onDragOver() {
      event.preventDefault();
      this.display.imageUrl = null;
    },
    onDragStart() {
      // event.preventDefault()
    },
    traceMouseMove(event) {
      if (this.display.hidden) {
        return;
      }
      const imageSrc = event.target.src;
      if (!imageSrc) {
        this.display.imageUrl = "";
        return;
      }
      this.display.imageUrl = imageSrc;
      let mX = event.pageX;
      // let mY = event.pageY;
      if (mX < window.innerWidth / 2) {
        this.display.left = false;
      } else {
        this.display.left = true;
      }
    },
  },
};
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
header {
  display: flex;
  align-items: stretch;
  background-color: blue;
  /* marginはみ出し対策 */
  border-top: 1px blue solid;
  width: 100%;
  height: 60px;
  color: white;
  position: fixed;
  z-index: 1;
  top: 0;

  .select-bar {
    width: calc((100% / 2));
    padding: 10px 0 0 20px;
    &.left {
      border-right: 2px white solid;
    }

    .deck-select {
      margin-top: 10px;
    }
  }
}
.content {
  display: flex;
  padding-top: 60px;
}
.deck-wrapper {
  width: calc(100% / 2);
  background-color: lightgray;
  &.left {
    border-right: 2px white solid;
  }
}
</style>