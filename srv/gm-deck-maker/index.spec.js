import { it, expect } from 'vitest'
import { getDeckData } from '.'

it('getDeckData', async () => {
  const deck = await getDeckData('ea1f26a4-6fa4-488b-876a-342575573b52')
  expect(deck.main_cards.length).toEqual(40)
})
