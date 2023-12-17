import { createStore } from 'vuex'
import createPersistedState from "vuex-persistedstate";

// https://next.vuex.vuejs.org/ja/guide/#%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%AA%E3%82%B9%E3%83%88%E3%82%A2
const store = createStore({
  plugins: [createPersistedState({
    // スクレイピングで取得したデッキデータをブラウザのLocal Storageに保存する。
    paths: ['decks', 'setting'],
  })],
  modules: {
    decks: {
      namespaced: true,
      state: {
        data: [],
      },
      mutations: {
        setData(state, data) {
          state.data = data
        }, // commit('decks/setData')
      },
    },
    setting: {
      namespaced: true,
      state: {
        readAbout: false,
      },
      mutations: {
        set(state, data) {
          Object.keys(data).forEach(key => {
            state[key] = data[key]
          })
        }, // commit('setting/set')
      },
    },
    builder: {
      namespaced: true,
      state: {
        draggingCard: null,
      },
      mutations: {
        setDraggingCard(state, data) {
          state.draggingCard = data
        },
      },
    }
  },
  state() {
    return {
      displayImageUrl: '',
      selectMode: false, // カードを重ねるときに使用。
      selectedCard: null, // セレクトモードではないが、カードを選択するとき使用する。
      hoveredCard: null,
      workSpace: {
        active: false,
        cards: [],
        zone: '',
        player: '',
        minimal: false,
        single: false, // シールドが重なっている場合や、進化クリーチャーの時もtrue
      },
      settings: {
        dropdownTriggers: ['click'],
      },
    }
  },
  mutations: {
    setDisplayImageUrl(state, url) {
      state.displayImageUrl = url
    },
    setSelectMode(state, data) {
      // セレクトモード変化時には選択中のカードを消す。
      state.selectedCard = null
      state.selectMode = data
      if (data === null) {
        state.displayImageUrl = ''
      }
    },
    setSelectedCard(state, card) {
      state.selectedCard = card
    },
    setHoveredCard(state, card) {
      state.hoveredCard = card
    },
    openWorkSpace(state, { cards, zone, player, single = false }) {
      // 既に開いている状態で、同じゾーンを開こうとした場合は閉じる。
      if (state.workSpace.active) {
        if (state.workSpace.player === player
          && state.workSpace.zone === zone
          && state.workSpace.cards.length === cards.length
        ) {
          store.commit('closeWorkSpace')
          return
        }
      }
      state.workSpace = {
        cards,
        zone,
        player,
        active: true,
        single,
      }
    },
    closeWorkSpace(state) {
      state.workSpace = {
        cards: [],
        zone: '',
        player: '',
        active: false,
      }
    },
    updateSettings(state, settings) {
      state.settings = {
        ...state.settings,
        ...settings,
      }
    },
  },
})

export default store
