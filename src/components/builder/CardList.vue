<template>
  <div>
    <div
      class="card-list"
      :id="side + 'draggable'"
      item-key="id"
    >
      <template v-for="card in deckCards">
        <div class="card-wrapper" :style="{
          width: `${cardWidth}px`
        }">
          <div class="card">
            <!-- insted of prevent default -->
            <div>
              <TextCard
                @mouseenter="isPhone() ? null : roomStore.setHoveredCard(card)"
                @mouseleave="isPhone() ? null : roomStore.setHoveredCard(null)"
                :card="card"
                :width="cardWidth"
                :selected="false"
                :deck="deck"
              ></TextCard>
            </div>

            <div class="cardTool">
              <div class="cardTool_times">
                <span style="margin-right: 2px">x</span>
                <span>{{ card.times }}</span>
              </div>

              <div v-if="deck.source === 'firebase'" class="cardTool_buttonGroup">
                <div class="cardTool_plus" @click.stop="addCardNum(card)">
                  <!-- <o-icon pack="fas" icon="plus"> </o-icon> -->
                  <o-button variant="danger" icon-right="plus" size="small" />
                </div>
                <div class="cardTool_minus" @click.stop="decrementCardNum(card)">
                  <o-button variant="info" icon-right="minus" size="small" />
                </div>
              </div>
            </div>

            <div 
              v-if="deck.source === 'firebase'"
              class="delele-button hidden"
              @click.stop="deleteCard(card)"
            >X</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance, computed } from 'vue';
import draggable from 'vuedraggable'
import { SourceCard, SourceDeck } from '@/entities/Deck'
import TextCard from '../elements/TextCard.vue'
import { isPhone } from '@/helpers/Util';
import { useRoomStore } from '@/stores/room';

const props = defineProps<{
  cards: SourceCard[]
  side: string
  deck: SourceDeck
}>()

const emit = defineEmits<{
  'delete-card': [SourceCard]
  'save-deck': []
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
function addCardNum(card: SourceCard) {
  if (card.times <= 3) {
    card.times += 1;
  }
  emit('save-deck')
}
function decrementCardNum(card: SourceCard) {
  if (card.times > 0) {
    card.times -= 1;
  }
  emit('save-deck')
}
function deleteCard(card: SourceCard) {
  emit('delete-card', card)
}

// hovered card
const roomStore = useRoomStore()
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