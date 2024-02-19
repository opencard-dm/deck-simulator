<template>
  <OnLongPress
    @trigger="openPopup()"
    @contextmenu.prevent
    :prevent="true"
  >
    <slot></slot>
  </OnLongPress>
</template>

<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import { isPhone } from '@/helpers/Util'
import { Card } from '@/entities/Card';
import { useRoomStore } from '@/stores/room';

const props = withDefaults(defineProps<{
  card: Card
}>(), {
  // card: null
})
const roomStore = useRoomStore()
const openPopup = () => {
  if (isPhone()) {
    roomStore.setHoveredCard(props.card)
  }
}
</script>
