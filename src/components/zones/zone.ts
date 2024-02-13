import { useStore } from "vuex";
import { store as Store } from '@/store/index'
import { cardState, groupableZone, player, zone } from "@/entities";
import { Card } from "@/entities/Card";
import { computed } from "vue";
import { changeCardsStateParams } from "@/helpers/CardActions";
import { CardDetail } from "@/entities/Deck";

export interface zoneProps {
    player: player
    cards: Card[]
    zone?: zone
}

export type zoneEmit = {
    'move-cards': [from: zone, to: zone, cards: Card[], player: player, prepend?: boolean]
    'change-cards-state': [param: changeCardsStateParams]
    'group-card': [param: {from: zone, to: groupableZone, fromCard: Card, toCard: Card, player: player}]
    'shuffle-cards': [from: zone, cards: Card[], player: player]
    'emit-room-state': [player: player]
}

export function useZone(props: zoneProps, emit: ReturnType<typeof defineEmits<zoneEmit>>) {
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
      if (selectMode.value) {
        emit('change-cards-state', {
          from: selectMode.value.zone,
          cards: [card],
          player: props.player,
          cardState: {
            tapped: !card.tapped
          }
        })
      }
      setSelectMode(null);
    }
    function setCardState(card: Card, cardState: cardState) {
      console.assert(props.zone, 'props.zone is required')
      emit('change-cards-state', {
        from: props.zone as zone,
        cards: [card],
        player: props.player,
        cardState: cardState,
      })
    }
    function setMarkColor(card: Card, color: string) {
      setSelectMode(null)
      console.assert(props.zone, 'props.zone is required')
      emit('change-cards-state', {
        from: props.zone as zone,
        cards: [card],
        player: props.player,
        cardState: {
          markColor: color
        },
      })
    }
    function hasSelectedCard() {
      // セレクトモードと本人であることを確認
      return selectMode.value?.player === props.player
    }
    // 重ねる先のカードを選ぶ状態
    function selectTargetMode() {
      return hasSelectedCard()
        && selectMode.value
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
    function cardDetail(card: Card) {
      let detail = {} as CardDetail
      try {
        detail = useStore().state.cardDetails[card.cd]
      } catch (error) {
        console.error('card not found:', card.cd)
      }
      detail = {} as CardDetail
      if (!detail.backImageUrl) {
        detail.backImageUrl = 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg'
      }
      return detail
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
        cardDetail,
    }
}

export function readableZone(zone: zone) {
  switch (zone) {
    case "tefudaCards":
      return '手札'
    case "shieldCards":
      return 'シールドゾーン'
    case "battleCards":
      return 'バトルゾーン'
    case "chojigenCards":
      return '超次元ゾーン'
    case "yamafudaCards":
      return '山札'
    case "manaCards":
      return 'マナゾーン'
    case "bochiCards":
      return '墓地'
    default:
      return '';
  }
}
