<template>
  <OnLongPress
    @trigger="openPopup(url)"
    @contextmenu.prevent
    :prevent="true"
  >
    <slot></slot>
  </OnLongPress>
</template>

<script setup>
import { OnLongPress } from '@vueuse/components'
import { isPhone } from '@/helpers/Util'
import { useStore } from 'vuex';

defineProps({
  url: String
})
const store = useStore()
const openPopup = (url) => {
  if (isPhone()) {
    store.commit('setDisplayImageUrl', url)
  }
}
</script>
