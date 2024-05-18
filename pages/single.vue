<template>
  <ClientOnly>
    <Suspense>
      <DuelRoomSuspense
        :single="true"
        :room-id="'single'"
      />
    </Suspense>
  </ClientOnly>
</template>

<script setup lang="ts">
import { RoomConfig } from '@/helpers/room';
import { SocketUtil } from '@/helpers/socket';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import DuelRoomSuspense from '@/components/DuelRoomSuspense.vue'
import { deleteTemporarilySavedGame } from '@@/core/services/game.service';

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
  deleteTemporarilySavedGame()
})
</script>
