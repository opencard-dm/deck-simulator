import { useStore } from "vuex";
import { store as Store } from '@/store/index'
import { cardState, player, zone, zoneGroup } from "@/entities";
import { Card } from "@/entities/Card";
import { mutations } from "@/store/mutations";
import { computed } from "vue";

export interface zoneProps {
    player: player,
    zone?: zone,
}

export type zoneEmit = {
    'move-cards': [from: zone, to: zone, cards: Card[], player: player, prepend?: boolean]
    'change-cards-state': []
    'group-card': [{from: zone, to: zoneGroup, fromCard: Card, toCard: Card, player: player}]
    'shuffle-cards': [from: zone, cards: Card[], player: player]
    'emit-room-state': []
}

export function useZone(props: zoneProps, emit: any) {
    const store = useStore()
    const workSpace = computed<typeof Store.state.workSpace>(() => store.state.workSpace)
    const selectMode = computed<typeof Store.state.selectMode>(() => store.state.selectMode)
    const selectedCard = computed<typeof Store.state.selectedCard>(() => store.state.selectedCard)
    const hoveredCard = computed<typeof Store.state.hoveredCard>(() => store.state.hoveredCard)

    const {
        openWorkSpace,
        closeWorkSpace,
        setSelectMode,
        setSelectedCard,
        setHoveredCard,
    }: any = {
        openWorkSpace: (...args: any[]) => store.commit('openWorkSpace', ...args),
        closeWorkSpace: (...args: any[]) => store.commit('closeWorkSpace', ...args),
        setSelectMode: (...args: any[]) => store.commit('setSelectMode', ...args),
        setSelectedCard: (...args: any[]) => store.commit('setSelectedCard', ...args),
        setHoveredCard: (...args: any[]) => store.commit('setHoveredCard', ...args),
    }

    function moveCard(from: zone, to: zone, card: Card, prepend = false) {
      emit('move-cards', from, to, [card], props.player, prepend);
    }
    function toggleTap(card: Card) {
      if (selectMode.value?.zone === 'manaCards') {
        // マナゾーンの場合タップ後に位置が変わるため、配列にプッシュして移動先の最後に表示されるようにする。
        emit('move-cards', 'manaCards', 'manaCards', [card], selectMode.value.player, false);
      }
      card.tapped = !card.tapped;
      setSelectMode(null);
      // 状態を送信
      emitState();
    }
    function setCardState(card: Card, cardState: cardState) {
      Object.keys(cardState).forEach((key) => {
        if (key === 'tapped' || key === 'faceDown') {
            card[key] = cardState[key] as any
        }
      })
      // 状態を送信
      emitState();
    }
    function setMarkColor(card: Card, color: string) {
      setSelectMode(null);
      card.markColor = color;
      emitState();
    }
    function hasSelectedCard() {
      // セレクトモードと本人であることを確認
      return selectMode.value?.player === props.player
    }
    // 重ねる先のカードを選ぶ状態
    function selectTargetMode() {
      return hasSelectedCard()
        && selectMode.value
        && !selectMode.value.card.groupId
        && selectMode.value.selectingTarget
    }
    function cardIsSelected(card: Card) {
      if (!card) return false
      if (hasSelectedCard() && selectMode.value?.card.id === card.id) {
        return true;
      }
      return false;
    }
    function moveSelectedCard(to: zone, prepend = false) {
      if (selectMode.value === null) return
      // 本人確認
      if (selectMode.value.player !== props.player) return
      emit('move-cards', selectMode.value.zone, to, [selectMode.value.card], props.player, prepend)
      setSelectMode(null)
    }
    function shuffleCards(from: zone, cards: Card[]) {
      emit('shuffle-cards', from, cards, props.player)
    }
    function emitState() {
      emit('emit-room-state', props.player)
    }
    return {
        emit,
        // state
        workSpace,
        selectMode,
        selectedCard,
        hoveredCard,
        // mutations
        openWorkSpace,
        closeWorkSpace,
        setSelectMode,
        setSelectedCard,
        setHoveredCard,
        // methods
        moveCard,
        toggleTap,
        setCardState,
        setMarkColor,
        hasSelectedCard,
        selectTargetMode,
        cardIsSelected,
        moveSelectedCard,
        shuffleCards,
        emitState,
    }
}
