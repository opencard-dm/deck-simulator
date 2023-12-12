<template>
  <DuelRoom
    v-if="!loading"
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
    :room="room"
  ></DuelRoom>
</template>

<script>
import axios from 'axios';
import DuelRoom from '../components/DuelRoom.vue';
import { SocketUtil } from '../helpers/socket'

export default {
  components: { DuelRoom },
  beforeRouteLeave (to, from, next) {
    SocketUtil.socket.emit('leave-room', this.roomId)
    console.log("room" + this.roomId + "から退室しました")
    next()
  },
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
    const room = await axios.get(`/api/rooms/${this.roomId}`)
    if (room.cookie) {
      document.cookie = room.cookie
    }
    this.room = room;
    SocketUtil.connect()
    SocketUtil.socket.emit("room", this.roomId);
    console.log("room" + this.roomId + "に入室しました")
    this.loading = false;
  },
}
</script>
