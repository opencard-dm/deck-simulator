
import { CardDetail } from "@/entities/Deck"
import { Card } from '@/entities/Card';
import { state } from "."

export const mutations = {
    setDisplayImageUrl(state: state, url: string) {
        state.displayImageUrl = url
    },
    setSelectMode(state: state, data) {
        // セレクトモード変化時には選択中のカードを消す。
        state.selectedCard = null
        state.selectMode = data
        if (data === null) {
            state.displayImageUrl = ''
        }
    },
    setSelectedCard(state: state, card: Card) {
        state.selectedCard = card
    },
    setHoveredCard(state: state, card: Card) {
        state.hoveredCard = card
    },
    openWorkSpace(state: state, { cards, zone, player, single = false }) {
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
            minimal: false,
            single,
        }
    },
    closeWorkSpace(state: state) {
        state.workSpace = {
            cards: [],
            zone: '',
            player: '',
            active: false,
            minimal: false,
            single: false,
        }
    },
    updateSettings(state: state, settings) {
        state.settings = {
            ...state.settings,
            ...settings,
        }
    },
    addCardDetails(state: state, cardDetails: {[key: string]: CardDetail}) {
        state.cardDetails = {
            ...state.cardDetails,
            ...cardDetails,
        }
    }
}