/**
 * yarn ts-node tools/getCardNames.ts
 */

import axios from 'axios'
import { writeFileSync } from 'fs'

main()

async function main() {
  // jsdelivrを利用して、別のgithubリポジトリから取得
  const { data: cardnames }: any = await axios.get('https://cdn.jsdelivr.net/gh/opencard-dm/card-database/cardnames.json')
  const cardNameIdMap: {[key: string]: string} = {}
  Object.keys(cardnames).forEach(cardname => {
    if (!cardname) return // カードの枠として無名のカードがある
    cardNameIdMap[cardname] = cardnames[cardname][0]
  })
  writeFileSync('src/cardnames.json', JSON.stringify(cardNameIdMap, null, 2));
}
