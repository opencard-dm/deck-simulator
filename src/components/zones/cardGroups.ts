import { Card, CardGroup } from "@/entities/Card";
import { computed } from "vue";
import { zoneProps } from "./zone";

export function useCardGroups(props: zoneProps) {
    const cardGroups = computed(() => {
        const groups: CardGroup[] = []
        const groupsMap: {[key: string]: CardGroup} = {}
        props.cards.forEach((c) => {
          if (c.groupId) {
                if (c.groupId in groupsMap) {
                    groupsMap[c.groupId].cards.push(c)
                } else {
                    const group = {
                        id: c.groupId,
                        cardIds: [c.id],
                        cards: [c],
                    }
                    groupsMap[c.groupId] = group
                    groups.push(group)
                }
            }
        })
        return groups
    })
    const visibleCards = computed(() => {
      // 表示するカードのIDのリスト
      const firstCardIds = cardGroups.value.map((g: CardGroup) => g.cards[0].id);
      const visibleCards = props.cards.filter((c) => {
        return !c.groupId || firstCardIds.includes(c.id)
      })
      return visibleCards
    })
    function getGroup(card: Card) {
        const group = cardGroups.value.find((g) => g.id === card.groupId)
        if (!group) {
            return null
        }
        return group;
    }
    return {
        visibleCards,
        cardGroups,
        getGroup,
    }
}