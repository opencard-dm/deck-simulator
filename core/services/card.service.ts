import { CardDetail, SourceDeck } from "@@/core/entities/Deck"
import { CardAbility } from "@@/core/entities/card"
import axios from "axios"
import implementedCardNames from "@/implementedCardNames.json"

export async function fetchCardDetails(deck: SourceDeck): Promise<{[key: string]: CardDetail}> {
  const cardIds: string[] = []
  deck.cards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
  deck.chojigenCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
  deck.grCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
  const { data: cards } = await axios.get('/api/cards', {
    params: {
      cardIds: cardIds.join(',')
    }
  })
  return cards
}

export async function fetchCardDetailsAndAbilities(deck: SourceDeck): Promise<{[key: string]: CardDetail}> {
  const cardDetails = await fetchCardDetails(deck)
  Object.values(cardDetails).forEach(cardDetail => {
    fetchCardAbility(cardDetail.name)
  })
  return cardDetails
}

const cardAbilities: {[key: string]: CardAbility} = {};

export async function fetchCardAbility(cardName: string): Promise<CardAbility|null> {
  if (!implementedCardNames.includes(cardName)) {
    return null
  }
  if (cardName in cardAbilities) {
    return cardAbilities[cardName]
  }
  try {
    const mod = await import(`/cards/${cardName}.js`)
    cardAbilities[cardName] = mod.default
    return cardAbilities[cardName]
  } catch (error) {
    return null
  }
}

export function getCardAbility(cardName: string): CardAbility|null {
  if (cardName in cardAbilities) {
    return cardAbilities[cardName]
  }
  return null
}
