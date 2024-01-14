(function () {
  const decks = []
  document.querySelectorAll('.deck-cardimage').forEach(elem => {
    const deckId = elem.id.split('deck-thumbnail-')[1]
    let name = document.querySelector('#deck-name-' + deckId).textContent
    name = name.replaceAll('【サンプルリスト】', '')
    decks.push({
      name,
      dmDeckId: deckId,
    })
  })
  console.log(JSON.stringify(decks, null, 2))
})()