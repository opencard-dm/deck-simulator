import { Card } from "@@/core/entities/card";
import { CardDetail } from "@@/core/entities/Deck";
import { useRoomStore } from "@/stores/room";
import { StringUtil } from "../utils/string";

const cardDataStore: {[key: string]: CardData} = {}

export function cardData(card: Card) {
  if (card.cd in cardDataStore) {
    return cardDataStore[card.cd]
  }
  const roomStore = useRoomStore()
  const cardDetail = roomStore.cardDetails[card.cd]
  const thisInstance = new CardData(cardDetail)
  return thisInstance
}

class CardData {

  cardDetail: CardDetail
  ability: {
    mekuraid: undefined | boolean
    lookDeckTopNumberOfCards: undefined | number
    kakumeiChange: undefined | boolean
  }

  constructor(cardDetail: CardDetail) {
    this.cardDetail = cardDetail
    this.ability = {} as any
    this.setDeckTopXAbility()
    this.setMekuraidAbility()
    this.setKakumeiChangeAbility()
  }
  
  get name() {
    return this.cardDetail.name
  }

  get types() {
    return this.cardDetail.types
  }

  get power() {
    return this.cardDetail.power
  }

  get power_int() {
    return this.cardDetail.power_int
  }

  get cost() {
    return this.cardDetail.cost
  }

  get civilizations() {
    return this.cardDetail.civilizations
  }

  get races() {
    return this.cardDetail.races
  }

  get card_text() {
    return this.cardDetail.card_text
  }

  get combined_card() {
    return this.cardDetail.combined_card
  }

  isRainbow() {
    const civilizations = [...this.civilizations]
    if (this.types.includes('ツインパクト') && this.combined_card) {
      this.combined_card.civilizations.forEach(c => {
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

  private setMekuraidAbility(): void {
    if (this.card_text.includes('メクレイド')) {
      this.ability.mekuraid = true
      return
    }
    if (this.types.includes('ツインパクト') && this.combined_card) {
      if (this.combined_card.card_text.includes('メクレイド')) {
        this.ability.mekuraid = true
        return
      }
    }
  }

  private setKakumeiChangeAbility(): void {
    if (this.card_text.includes('革命チェンジ')) {
      this.ability.kakumeiChange = true
      return
    }
    // クリーチャーのみが持つ能力のため、ツインパクトの下面はチェックしない
  }

  private setDeckTopXAbility(): void {
    const match = this.card_text.match(/山札の上から([０-９]+)枚を見/)
    if (match) {
      this.ability.lookDeckTopNumberOfCards = parseInt(StringUtil.toHalfNum(match[1]))
      return
    }
    // クリーチャー面になかった場合はツインパクト面もチェックする
    if (this.combined_card) {
      const match2 = this.card_text.match(/山札の上から([０-９]+)枚を見/)
      if (match2) {
        this.ability.lookDeckTopNumberOfCards = parseInt(StringUtil.toHalfNum(match2[1]))
        return
      }
    }
  }
}
