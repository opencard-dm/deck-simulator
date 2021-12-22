import { createStore } from 'vuex'

// https://next.vuex.vuejs.org/ja/guide/#%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%AA%E3%82%B9%E3%83%88%E3%82%A2
const store = createStore({
  state () {
    return {
      selectMode: false, // カードを重ねるときに使用。
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
    setSelectMode(state, boolVal) {
      state.selectMode = boolVal
    },
    openWorkSpace(state, {cards, zone, player, single=false}) {
      // 既に開いている状態で、同じゾーンを開こうとした場合は閉じる。
      if (state.workSpace.active) {
        if (state.workSpace.player === player && state.workSpace.zone === zone) {
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
    }
  },
})

export default store
