<template>
  <DuelRoom
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :room="room"
    :roomId="roomId"
    :loading="loading"
    :single="false"
    :deck="null"
  ></DuelRoom>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute } from 'vue-router'
const route = useRoute()
const roomId = route.query.roomId as string || 'single'
onBeforeRouteLeave((to, from, next) => {
  SocketUtil.socket?.emit('leave-room', roomId)
  console.log("room-" + roomId + "から退室しました")
  next()
})
</script>

<script lang="ts">
import axios from 'axios';
import DuelRoom from '../components/DuelRoom.vue';
import { SocketUtil } from '../helpers/socket'
import { RoomConfig } from '@/helpers/room';

export default {
  components: { DuelRoom },
  data() {
    return {
      loading: true,
      room: {},
      upperPlayer: this.$route.query.player === "a" ? "b" : "a",
      lowerPlayer: this.$route.query.player,
    };
  },
  computed: {
    roomId() {
      return this.$route.query.roomId
    }
  },
  async created() {
    const { data: room } = await axios.get(`/api/rooms/${this.roomId}`)
    if (room.cookie) {
      document.cookie = room.cookie
    }
    RoomConfig.useFirebase = true
    this.room = room;
    SocketUtil.connect()
    SocketUtil.socket.emit("room", this.roomId);
    console.log("room" + this.roomId + "に入室しました")
    this.loading = false;
  },
}
</script>
