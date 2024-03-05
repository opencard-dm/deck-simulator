/**
 * 公式のカード検索の画面の検証ツールから、種族一覧を取得する
 * https://dm.takaratomy.co.jp/card/
 */
(function() {
  const races = []
  Array.from(document.querySelector('[name="race"]').options).forEach(o => {
    races.push(o.value)
  })
  races.sort()
  console.log(JSON.stringify(races, null, 2))
})()
