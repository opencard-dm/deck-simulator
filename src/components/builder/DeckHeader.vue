<template>
  <div class="deck-header">
    <div class="deck-select">
      <select
        name="deckId"
        id="select-deck"
        @change="($event) => {
          emit('change-deck', $event.target.value)
        }"
        :value="deckIndex"
      >
        <option
          v-for="(deck, index) in deckList"
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
        @click.stop="emit('update-deck')"
        v-if="deckData.source === 'firebase'"
        >変更を保存</span
      >
      <span
        class="click"
        @click.stop="openModal(deckData.name, 'update')"
        v-if="deckData.source === 'firebase'"
        >名前を変更</span
      >
      <span 
        v-if="deckData.source === 'firebase'"
        class="click"
        @click.stop="modal.delete = true"
      >デッキを削除</span>
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

const params = reactive({
  name: "",
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
  "change-deck": [number]
  "create-deck": []
  "update-deck": []
  "delete-deck": []
  "copy-deck": []
}>()
function openModal(name: string, method: 'create' | 'update' | 'delete') {
  params.name = name;
  modal[method] = true;
}
function updateDeckName() {
  props.deckData.name = params.name
  emit('update-deck')
  modal.update = false
}
function deleteDeck() {
  emit("delete-deck");
  modal.delete = false;
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