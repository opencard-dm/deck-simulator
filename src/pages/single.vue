<template>
  <Suspense>
    <DuelRoomSuspense :single="true" :roomId="'single'"></DuelRoomSuspense>
  </Suspense>
</template>

<script setup lang="ts">
import { RoomConfig } from '@/helpers/room';
import { SocketUtil } from '@/helpers/socket';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import DuelRoomSuspense from '../components/DuelRoomSuspense.vue'

const router = useRouter()
const route = useRoute()

RoomConfig.useFirebase = false
SocketUtil.socket = null
// validation
const deckId = route.query.deck_id as string
if (!deckId) {
  router.push('/')
}
onBeforeRouteLeave(() => {
  sessionStorage.removeItem('room-single')
  console.debug('deleted session storage cache. key=room-single')
})
</script>
