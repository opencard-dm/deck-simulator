<template>
  <Suspense>
    <DuelRoomSuspense :single="false" :room-id="roomId"></DuelRoomSuspense>
  </Suspense>
</template>

<script setup lang="ts">
import { RoomConfig } from '@/helpers/room';
import { SocketUtil } from '@/helpers/socket';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import DuelRoomSuspense from '../components/DuelRoomSuspense.vue'

const route = useRoute()
const roomId = route.query.roomId as string

onBeforeRouteLeave((to, from, next) => {
  SocketUtil.socket?.emit('leave-room', roomId)
  console.log("room-" + roomId + "から退室しました")
  next()
})

RoomConfig.useFirebase = true
if (!RoomConfig.useFirebase) {
  SocketUtil.connect()
  SocketUtil.socket?.emit("room", roomId);
  console.log("room" + roomId + "に入室しました")
}
</script>
