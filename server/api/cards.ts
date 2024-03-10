import { getCardsByIds } from '../services/roomService'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.cardIds) {
    return res.json({}).status(422)
  }
  const cardIds = String(query.cardIds).split(',').map(s => s.trim())
  const cardDocs = await getCardsByIds(cardIds)
  const cards = {}
  cardDocs.forEach(doc => {
    cards[doc.id] = doc.data()
  })
  return cards
})