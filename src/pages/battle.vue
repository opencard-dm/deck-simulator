<template>
  <div class="markdownWrapper">
    <div id="app" style="padding: 20px; background-color: white">
      <o-button variant="info" size="small" @click="createRoom()"
        >部屋を作る</o-button
      >
    </div>
    <MarkdownIt class="markdown-body" :source="battlemd"></MarkdownIt>
    <p style="margin-top: 30px;">
      <o-tooltip
        label="はじめにお読みください"
        variant="warning"
        position="right"
        :always="!readAbout"
        :active="!readAbout"
        :triggers="[]"
      >
        <router-link to="/about">このサイトについて</router-link>
      </o-tooltip>
    </p>
  </div>
</template>

<script>
import { makeRandomString } from "@/helpers/makeRandomString";
import axios from "axios";
import battlemd from "../assets/markdown/battle.md";

export default {
  data() {
    return {
      sending: false,
      battlemd,
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
      let target = "";
      if (cookie) {
        cookie.split(";").forEach((seg) => {
          const trimed = seg.trim();
          if (trimed.startsWith("GAESA=")) {
            target = trimed;
          }
        });
      }
      return target;
    },
    async createRoom() {
      if (this.sending) return;
      this.sending = true;
      const roomId = this.randomRoomId();
      await axios.put(`/api/rooms/${roomId}`, {
        cookie: this.getCloudRunCookie(),
      });
      this.$router.push({
        path: "room",
        query: { roomId, player: "a" },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.send {
  margin-left: 10px;
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
.markdownWrapper {
  ul,
  ol {
    list-style: initial;
  }
  max-width: 800px;
  padding: 20px 10px;
  @media screen and (min-device-width: 800px) {
    padding: 20px 40px;
  }
}
</style>
