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
import { useStore } from 'vuex';
import { Card } from '@/entities/Card';

const props = withDefaults(defineProps<{
  card: Card
}>(), {
  // card: null
})
const store = useStore()
const openPopup = () => {
  if (isPhone()) {
    store.commit('setHoveredCard', props.card)
  }
}
</script>
