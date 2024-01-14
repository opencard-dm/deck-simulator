<template>
  <OnLongPress
    @trigger="openPopup(url)"
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
  url: string,
  card?: Card
}>(), {
  // card: null
})
const store = useStore()
const openPopup = (url: string) => {
  if (isPhone()) {
    store.commit('setDisplayImageUrl', url)
    store.commit('setHoveredCard', props.card)
  }
}
</script>
