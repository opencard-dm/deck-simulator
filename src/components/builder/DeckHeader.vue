<template>
  <div class="deck-header">
    <div class="deck-select">
      <select
        name="deckId"
        id="select-deck"
        @change="changeDeck"
        v-model="selected.index"
      >
        <option
          v-for="(deck, index) in deckList[selected.deckType]"
          :value="index"
          :key="index"
        >
          {{ deck.name }}
        </option>
      </select>
    </div>
    <div class="small">
      <span>合計枚数{{ totalNum }}</span>
      <span
        class="save-button click"
        @click.stop="updateDeck()"
        v-if="selected.deckType === 'custom'"
        >変更を保存</span
      >
      <span
        class="click"
        @click.stop="openModal(deckList['custom'][selected.index].name, 'update')"
        v-if="selected.deckType === 'custom'"
        >名前を変更</span
      >
      <span class="click" @click.stop="modal.delete = true">デッキを削除</span>
      <span class="click" @click.stop="emit('copy-deck')">コピー</span>
    </div>

    <Modal
      class="deck-header-modal"
      v-if="modal.update"
      @close-modal="modal.update = false"
    >
      <template v-slot:content>
        <div>
          <p>デッキの名前を入力してください</p>
        </div>
        <div>
          <input v-model="params.name" />
        </div>
      </template>
      <template v-slot:footer>
        <button @click.stop="updateDeckName">変更</button>
      </template>
    </Modal>

    <Modal
      class="deck-header-modal"
      v-if="modal.create"
      @close-modal="modal.create = false"
    >
      <template v-slot:content>
        <div>
          <p>カード画像のURLを貼り付けてください</p>
        </div>
        <div>
          <input v-model="params.cardUrl" />
        </div>
      </template>
      <template v-slot:footer>
        <button @click.stop="addCard">追加</button>
      </template>
    </Modal>

    <Modal
      class="deck-header-modal"
      v-if="modal.delete"
      @close-modal="modal.delete = false"
    >
      <template v-slot:content>
        <div>
          <p>デッキを削除してもよろしいですか？</p>
          <p style="font-size: 12px; margin-top:10px;">※削除後には画面のリロードが行われるため、変更の保存はあらかじめお済ませください。</p>
        </div>
      </template>
      <template v-slot:footer>
        <button style="margin-right: 8px" @click.stop="modal.delete = false">キャンセル</button>
        <button @click.stop="deleteDeck">削除</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import Modal from "./Modal.vue";
import { SourceDeck } from '@/entities/Deck'

const props = defineProps<{
  deckData: SourceDeck
  deckList: SourceDeck[]
  side: string
  deckIndex: number
}>()

const selected = reactive({
  deckType: "custom",
  index: props.deckIndex,
})
const params = reactive({
  name: "",
  cardUrl: "",
})
const modal = reactive({
  create: false,
  update: false,
  delete: false,
})

const totalNum = computed(() => {
  let result = 0;
  for (const card of props.deckData.cards) {
    result += card.times;
  }
  return result;
})

const emit = defineEmits<{
  "change-deck": [string, number]
  "create-deck": []
  "update-deck": []
  "delete-deck": []
  "copy-deck": []
}>()
function openModal(name, method) {
  params.name = name;
  modal[method] = true;
}
function changeDeck() {
  emit("change-deck", selected.deckType, selected.index);
  // parent[this.side].deckData = parent.deckList[index];
}
function updateDeck() {
  emit("update-deck", params, props.side);
}
function updateDeckName() {
  // parent.deckList[this.selected.deckType][
  //   this.selected.index
  // ].name = this.params.name;
  this.updateDeck();
  this.modal.update = false;
  this.params.name = "";
}
function createDeck() {
  this.modal.create = false;
  emit("create-deck", params, props.side, selected);
  params.name = "";
}
function addCard() {
  emit("update-deck", params, props.side);
  params.cardUrl = ""
}
function deleteDeck() {
  emit("delete-deck", props.side);
  this.modal.delete = false;
}
</script>

<style lang="scss" scoped>
.deck-header {
  background-color: #005c98;
  /* marginはみ出し対策 */
  border-top: 1px #005c98 solid;
  width: 100%;
  height: 60px;
  color: white;
  padding: 10px 0 0 20px;
  .small {
    margin-top: 4px;
    font-size: 12px;
  }
  .click {
    margin-left: 10px;
    cursor: pointer;
    &:hover {
      color: orange;
    }
  }

  .deck-header-modal {
    input {
      width: 100%;
    }
  }
}
</style>