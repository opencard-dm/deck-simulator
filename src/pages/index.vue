<template>
  <div>
    <div id="app" style="padding: 20px; background-color: white">
      <p>
        部屋を選択してください<a
          class="deckForm_searchField_help"
          href="https://note.com/tcgsimulator/n/n3f94a7d126f3#46479139-fd8d-4731-8329-32a75616f604"
          target="_blank"
          rel="noopener"
          style="vertical-align: middle"
        >
          <o-icon pack="far" icon="question-circle"></o-icon>
        </a>
      </p>
      <table class="roomTable" style="margin-top: 20px">
        <thead>
          <th></th>
          <th><div>プレイヤーA</div></th>
          <th><div>プレイヤーB</div></th>
        </thead>
        <tr v-for="room in rooms" :key="room.id">
          <td>
            <div>部屋{{ room.id }}</div>
          </td>
          <td>
            <router-link
              :to="{
                path: '/room',
                query: { roomId: room.id, player: 'a' },
              }"
            >
              <o-button variant="info" size="small"> {{ room.id }}-A</o-button>
            </router-link>
          </td>
          <td>
            <router-link
              :to="{
                path: '/room',
                query: { roomId: room.id, player: 'b' },
              }"
            >
              <o-button variant="info" size="small"> {{ room.id }}-B</o-button>
            </router-link>
          </td>
        </tr>
        <tr>
          <td>部屋x</td>
          <td colspan="2">
            <o-button variant="info" size="small" @click="createRoom()">部屋を作る</o-button>
          </td>
        </tr>
      </table>
      <div class="index_links">
        <!-- <p v-if="decks.length > 0">
          <router-link to="/builder">自分のデッキを編集</router-link>
        </p> -->
        <p>
          <o-tooltip
            label="はじめにお読みください"
            variant="warning"
            position="right"
            always
            :active="!readAbout"
          >
            <router-link to="/about">このサイトについて</router-link>
          </o-tooltip>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { makeRandomString } from "@/helpers/makeRandomString";
import axios from 'axios';

export default {
  data() {
    return {
      rooms: [{ id: "1" }, { id: "2" }, { id: "3" }],
    };
  },
  computed: {
    decks() {
      return this.$store.state.decks.data;
    },
    readAbout() {
      return this.$store.state.setting.readAbout;
    },
  },
  methods: {
    randomRoomId() {
      return makeRandomString(4) + "-" + makeRandomString(3);
    },
    getCloudRunCookie() {
      const cookie = document.cookie;
      let target = ''
      if (cookie) {
        cookie.split(';').forEach(seg => {
          const trimed = seg.trim()
          if (trimed.startsWith('GAESA=')) {
            target = trimed
          }
        })
      }
      return target
    },
    async createRoom() {
      const roomId = this.randomRoomId()
      await axios.put(`/api/rooms/${roomId}`, {
        cookie: this.getCloudRunCookie()
      })
      this.$router.push({
        path: 'room',
        query: { roomId, player: 'a' },
      })
    }
  },
};
</script>

<style lang="scss" scoped>
.send {
  margin-left: 10px;
}
.roomTable {
  border-collapse: collapse;
  th,
  td {
    border: 1px solid darkgray;
    padding: 5px 10px;
    > * {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
a {
  text-decoration: none;
  color: #000;
  &:hover {
    opacity: 0.8;
  }
}
.index_links {
  margin-top: 2rem;
  * + * {
    margin-top: 1rem;
  }
}
</style>
