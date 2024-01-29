import { player, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { DecksSource } from '@/entities/Deck';
import { createStore } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import { mutations } from './mutations'
import { CardDetail } from '@/entities/Deck';

export interface state {
  displayImageUrl: string
  selectMode: {
    player: player
    zone: zone
    card: Card
    selectingTarget: boolean
  } | null
  selectedCard: Card | null
  hoveredCard: Card | null
  workSpace: {
    active: boolean
    cards: Card[]
    zone: zone | ''
    player: player | ''
    minimal: boolean
    single: boolean
  }
  settings: {
    dropdownTriggers: string[]
  }
  cardDetails: {[key: string]: CardDetail}
}

// https://next.vuex.vuejs.org/ja/guide/#%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%AA%E3%82%B9%E3%83%88%E3%82%A2
export const store = createStore({
  plugins: [createPersistedState({
    // スクレイピングで取得したデッキデータをブラウザのLocal Storageに保存する。
    paths: ['setting', 'decks'],
  })],
  modules: {
    decks: {
      namespaced: true,
      state: {
        data: [],
      },
      mutations: {
        setData(state, data: DecksSource[]|DecksSource) {
          if (Array.isArray(data)) {
            state.data = data
            return
          }
          const index = state.data.findIndex((d: DecksSource) => {
            return d.url === data.url
          })
          if (index === -1) {
            state.data.push(data)
          } else {
            state.data[index] = data
          }
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
    const initState: state = {
      displayImageUrl: '',
      selectMode: null, // カードを重ねるときに使用。
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
      cardDetails: {},
    }
    return initState
  },
  mutations: mutations,
})

export default store
