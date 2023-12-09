<template>
  <DuelRoom
    :upper-player="upperPlayer"
    :lower-player="lowerPlayer"
  ></DuelRoom>
</template>

<script>
import DuelRoom from '../components/DuelRoom.vue';

export default {
  components: { DuelRoom },
  beforeRouteLeave (to, from, next) {
    this.$socket.emit('leave-room', this.roomId)
    console.log("room" + this.roomId + "から退室しました")
    next()
  },
  data() {
    return {
      upperPlayer: this.$route.query.player === "a" ? "b" : "a",
      lowerPlayer: this.$route.query.player,
    };
  },
  computed: {
    roomId() {
      return this.$route.query.roomId
    }
  },
  created() {
    if (this.$socket) {
      // room{Id}チャンネルに接続
      this.$socket.emit("room", this.roomId);
      console.log("room" + this.roomId + "に入室しました")
    }
  },
}
</script>
