import { useRoomStore } from "@/stores/room";
import type { PlayerType } from "@@/core/entities/player";
import { Card, cardState } from "@@/core/entities/card";
import { GroupableZoneType, ZoneType } from "@@/core/entities/zones";
import { computed } from "vue";
import { changeCardsStateParams } from "@@/core/usecase/CardActions";
import { CardDetail } from "@@/core/entities/Deck";

export interface zoneProps {
    player: PlayerType
    cards: Card[]
    zone?: ZoneType
}

export type zoneEmit = {
    'move-cards': [from: ZoneType, to: ZoneType, cards: Card[], player: PlayerType, prepend?: boolean]
    'change-cards-state': [param: changeCardsStateParams]
    'group-card': [param: {from: ZoneType, to: GroupableZoneType, fromCard: Card, toCard: Card, player: PlayerType}]
    'shuffle-cards': [from: ZoneType, cards: Card[], player: PlayerType]
    'emit-room-state': [player: PlayerType]
}

export function useZone(props: zoneProps, emit: ReturnType<typeof defineEmits<zoneEmit>>) {
    const store = useRoomStore()
    const workSpace = computed(() => store.workSpace)
    const selectMode = computed(() => store.selectMode)
    const selectedCard = computed(() => store.selectedCard)
    const hoveredCard = computed(() => store.hoveredCard)

    const {
        openWorkSpace,
        closeWorkSpace,
        setSelectMode,
        setSelectedCard,
        setHoveredCard,
    }: any = {
        openWorkSpace: (...args: Parameters<typeof store.openWorkSpace>) => store.openWorkSpace(...args),
        closeWorkSpace: (...args: Parameters<typeof store.closeWorkSpace>) => store.closeWorkSpace(...args),
        setSelectMode: (...args: Parameters<typeof store.setSelectMode>) => store.setSelectMode(...args),
        setSelectedCard: (...args: Parameters<typeof store.setSelectedCard>) => store.setSelectedCard(...args),
        setHoveredCard: (...args: Parameters<typeof store.setHoveredCard>) => store.setHoveredCard(...args),
    }

    function moveCard(from: ZoneType, to: ZoneType, card: Card, prepend = false) {
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
        from: props.zone as ZoneType,
        cards: [card],
        player: props.player,
        cardState: cardState,
      })
    }
    function setMarkColor(card: Card, color: string) {
      setSelectMode(null)
      console.assert(props.zone, 'props.zone is required')
      emit('change-cards-state', {
        from: props.zone as ZoneType,
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
    function moveSelectedCard(to: ZoneType, prepend = false) {
      if (selectMode.value === null) return
      // 本人確認
      if (selectMode.value.player !== props.player) return
      emit('move-cards', selectMode.value.zone, to, [selectMode.value.card], props.player, prepend)
      setSelectMode(null)
    }
    function shuffleCards(from: ZoneType, cards: Card[]) {
      emit('shuffle-cards', from, cards, props.player)
    }
    function emitState() {
      emit('emit-room-state', props.player)
    }
    function cardDetail(card: Card) {
      let detail = {} as CardDetail
      try {
        detail = store.cardDetails[card.cd]
      } catch (error) {
        console.error('card not found:', card.cd)
      }
      if (!detail) {
        detail = {} as CardDetail
      }
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

export function readableZone(zone: ZoneType) {
  switch (zone) {
    case "tefudaZone":
      return '手札'
    case "shieldZone":
      return 'シールドゾーン'
    case "battleZone":
      return 'バトルゾーン'
    case "chojigenZone":
      return '超次元ゾーン'
    case "yamafudaZone":
      return '山札'
    case "manaZone":
      return 'マナゾーン'
    case "bochiZone":
      return '墓地'
    default:
      return '';
  }
}
