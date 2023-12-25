
export const mutations = {
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
            minimal: false,
            single,
        }
    },
    closeWorkSpace(state) {
        state.workSpace = {
            cards: [],
            zone: '',
            player: '',
            active: false,
            minimal: false,
            single: false,
        }
    },
    updateSettings(state, settings) {
        state.settings = {
            ...state.settings,
            ...settings,
        }
    },
}