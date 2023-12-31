<template>
  <Suspense>
    <DuelRoomSuspense :single="false" :room-id="roomId"></DuelRoomSuspense>
  </Suspense>
</template>

<script setup lang="ts">
import { RoomConfig } from '@/helpers/room';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import DuelRoomSuspense from '../components/DuelRoomSuspense.vue'
import { SocketUtil } from '@/helpers/socket';

const route = useRoute()
const roomId = route.query.roomId as string

onBeforeRouteLeave((to, from, next) => {
  console.log("room-" + roomId + "から退室しました")
  next()
})

RoomConfig.useFirebase = true
SocketUtil.socket = null
</script>
