import { expect, it } from 'vitest'
import { fetchDeck } from './GoogleSheetInput'

it('Google SpreadSheetからデッキデータを取得', async () => {
    const url = "https://docs.google.com/spreadsheets/d/1mqN0WQxLc5ksaUTnkZ_j23ODwUViUJIo1oJx-RjwkFA/export?format=xlsx";
    await fetchDeck(url)
})
