import { defineStore } from 'pinia'
import type { PlayerType } from "@@/core/entities/player";
import { Card } from '@@/core/entities/card';
import { ZoneType } from '@@/core/entities/zones';
import { CardDetail } from '@@/core/entities/Deck';

export interface State {
  selectMode: {
    player: PlayerType
    zone: ZoneType
    card: Card
    selectingTarget: boolean
  } | null
  selectedCard: Card | null
  hoveredCard: Card | null
  workSpace: {
    active: boolean
    cards: Card[]
    zone: ZoneType | ''
    player: PlayerType | ''
    minimal: boolean
    single: boolean
  }
  settings: {
    dropdownTriggers: string[]
  }
  cardDetails: {[key: string]: CardDetail}
}

export const useRoomStore = defineStore('state', {
  state: (): State => ({
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
  }),
  actions: {
    setSelectMode(data) {
      // セレクトモード変化時には選択中のカードを消す。
      this.selectedCard = null
      this.selectMode = data
    },
    setSelectedCard(card: Card) {
        this.selectedCard = card
    },
    setHoveredCard(card: Card | null) {
        this.hoveredCard = card
    },
    openWorkSpace({ cards, zone, player, single = false }: {
      cards: Card[],
      zone: ZoneType,
      player: PlayerType,
      single: boolean
    }) {
      // 既に開いている状態で、同じゾーンを開こうとした場合は閉じる。
      if (this.workSpace.active) {
        if (this.workSpace.player === player
        && this.workSpace.zone === zone
        && this.workSpace.cards.length === cards.length
        ) {
        this.closeWorkSpace()
        return
        }
      }
      this.workSpace = {
        cards,
        zone,
        player,
        active: true,
        minimal: false,
        single,
      }
    },
    closeWorkSpace() {
      this.workSpace = {
        cards: [],
        zone: '',
        player: '',
        active: false,
        minimal: false,
        single: false,
      }
    },
    updateSettings(settings) {
      this.settings = {
        ...this.settings,
        ...settings,
      }
    },
    addCardDetails(cardDetails: {[key: string]: CardDetail}) {
      this.cardDetails = {
        ...this.cardDetails,
        ...cardDetails,
      }
    }
  }
})
