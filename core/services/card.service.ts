import { CardDetail, SourceDeck } from "@/entities/Deck"
import axios from "axios"

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
