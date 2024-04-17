import { Card } from "@/entities/Card";
import { CardDetail } from "@/entities/Deck";
import { useRoomStore } from "@/stores/room";

export function cardData(card: Card) {
  // TODO card.cdをキーとしてキャッシュを取っておく
  const roomStore = useRoomStore()
  const cardDetail = roomStore.cardDetails[card.cd]
  return new CardData(cardDetail)
}

class CardData {

  cardDetail: CardDetail

  constructor(cardDetail: CardDetail) {
    this.cardDetail = cardDetail
  }

  isRainbow() {
    const civilizations = [...this.cardDetail.civilizations]
    if (this.cardDetail.types.includes('ツインパクト') && this.cardDetail.combined_card) {
      this.cardDetail.combined_card.civilizations.forEach(c => {
        if (!civilizations.includes(c)) {
          civilizations.push(c)
        }
      })
    }
    if (civilizations.length >= 2) {
      return true
    }
    return false
  }
}
