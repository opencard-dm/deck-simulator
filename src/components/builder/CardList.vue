<template>
  <div>
    <draggable
      v-model="deckCards"
      class="card-list"
      :id="side + 'draggable'"
      item-key="id"
      :group="{ name: 'deck', pull: 'clone', put: true }"
      :data-side="side"
      :move="onMove"
      :sort="false"
      :clone="
        (origin) => {
          return { ...origin, times: 0 };
        }
      "
      @start="onDragstart"
      @end="setDraggingCard(null)"
    >
      <template #item="{ element }">
        <div class="card-wrapper" :style="{
          width: `${cardWidth}px`
        }">
          <div class="card">
            <!-- insted of prevent default -->
            <div draggable="true">
              <TextCard
                :card="element"
                :width="cardWidth"
                :selected="false"
                :deck="deck"
              ></TextCard>
            </div>

            <div class="cardTool">
              <div class="cardTool_times">
                <span style="margin-right: 2px">x</span>
                <span>{{ element.times }}</span>
              </div>

              <div class="cardTool_buttonGroup">
                <div class="cardTool_plus" @click.stop="addCardNum(element)">
                  <!-- <o-icon pack="fas" icon="plus"> </o-icon> -->
                  <o-button variant="danger" icon-right="plus" size="small" />
                </div>
                <div class="cardTool_minus" @click.stop="decrementCardNum(element)">
                  <o-button variant="info" icon-right="minus" size="small" />
                </div>
              </div>
            </div>

            <div class="delele-button hidden" @click.stop="deleteCard(element)">X</div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance, computed } from 'vue';
import draggable from 'vuedraggable'
import { SourceCard, SourceDeck } from '@/entities/Deck'
import TextCard from '../elements/TextCard.vue'

const props = defineProps<{
  cards: SourceCard
  side: string
  deck: SourceDeck
}>()

// const store = useStore()

const deckCards = computed({
  get() {
    return props.cards;
  },
  set(newVal) {
    // すでに含まれているカードがあれば更新しない。
    if (
      props.cards.find(
        (c) => c.imageUrl === this.$store.state.builder.draggingCard.imageUrl
      )
    ) {
      console.log("すでに含まれているカードです。");
      return;
    }
    this.$emit("update:cards", newVal);
  },
})
const cardWidth = computed(() => 80)

let instance: ReturnType<typeof getCurrentInstance> = null
onMounted(() => {
  instance = getCurrentInstance();
});

function dragCardStart(event) {
  const card = props.cards[event.oldIndex];
  instance.parent.dragging = {
    card: card,
    side: this.side,
  };
}
function cloneNew(original) {
  let after = Object.assign({}, original);
  after.times = 0;
  return after;
}
function checkMove(event) {
  // 要検討
  // 他のデッキリストに移動したいかチェックしたい
  const targetZone = event.to.getAttribute("data-side");
  if (targetZone !== event.from.getAttribute("data-side")) {
    for (let c of instance.parent[targetZone]["deckData"]["cards"]) {
      if (c.imageUrl === event.draggedContext.element.imageUrl) {
        return false;
      }
    }
  }
  return true;
}
function addCardNum(card) {
  if (card.times <= 3) {
    card.times += 1;
  }
}
function decrementCardNum(card) {
  if (card.times === 0) {
    if (window.confirm("削除してもよろしいですか?")) {
      // this.$emit('delete-card', card, this.side);
      this.deleteCard(card);
    }
  }
  if (card.times > 0) {
    card.times -= 1;
  }
}
function deleteCard(card) {
  let filterd = [];
  for (let c of this.cards) {
    if (c.imageUrl !== card.imageUrl) {
      filterd.push(c);
    }
  }
  instance.parent[this.side]["deckData"]["cards"] = filterd;
}
function onMove(evt) {
  // https://github.com/SortableJS/vue.draggable.next#move
  // evt.draggedContext.element.time = 0;
  this.setDraggingCard(evt.draggedContext.element);
}
function onDragstart(evt) {
  this.setDraggingCard(evt.item.__draggable_context);
}
</script>

<style lang="scss" scoped>
.card-list {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  > * {
    margin: 0 10px 15px 0px;
  }
}

.card-wrapper {
  position: relative;
  &:hover {
    .delele-button {
      display: block;
    }
  }
  .delele-button {
    position: absolute;
    top: -5px;
    left: -5px;
    background-color: white;
    font-size: 18px;
    padding: 3px;
    font-weight: 800;
    cursor: pointer;
    &:hover {
      color: red;
    }
  }

  img {
    width: 100%;
  }
  .cardTool {
    /* background-color: red; */
    display: flex;
    align-items: center;
    height: 30px;
    width: 100%;
    .cardTool_times {
      margin-left: 2px;
      margin-right: auto;
      font-weight: 500;
      font-size: 14px;
    }
    &_buttonGroup {
      display: flex;
      > :first-child > * {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      > :last-child > * {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
}
</style>