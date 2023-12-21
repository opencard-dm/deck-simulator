import firebase from 'firebase/app/dist/index.cjs.js';
import 'firebase/firestore/dist/index.cjs.js';
import { getRegulationName, getImageUrl } from './DeckMakerUtil.js';

// Firestoreからデッキリストを取得するクラス
// {{{ DeckRecipeInfo = function(categoryId, deckId, noImageUrl) {
// コンストラクタを作成
export function DeckRecipeInfo(categoryId, deckId, noImageUrl, firebaseConfig) {
  this.categoryId = categoryId
  this.deckId = deckId
  if (firebase.apps.length === 0) {
    // Firestoreの初期化
    firebase.initializeApp(firebaseConfig)
  }
  this.db = firebase.firestore()
  this.publicDeckData = null
  this.deckCardData = null
  this.noImageUrl = noImageUrl
  // Firestoreのシステム情報の取得
  // this.db.settings({
  //   timestampsInSnapshots: true
  // })
  const { increment } = firebase.firestore.FieldValue
  this.increment = increment
  // const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp()
}
// }}}
// {{{ DeckRecipeInfo.prototype.updateDeckDetail = async function() {
// デッキ詳細の表示を更新
DeckRecipeInfo.prototype.updateDeckDetail = async function() {
  const categoryName = 'dm' // yg, dm, ygrd
  
  // 公開デッキのカード情報を取得
  const publicDeckSnap = await this.getPublicDeckSnap()
  const deckCardSnap = await this.getDeckCardsBaseRef()
    .doc(this.deckId)
    .get()

  var not_exists = deckCardSnap.exists
  var deck_card = null
  if (deckCardSnap.exists) {
    deck_card = deckCardSnap.data()
    if (deck_card.deleted_at !== null) {
      not_exists = false
    }
  }
  if (not_exists) {
    if (deck_card.legend === 1) {
      const tournamentInfoSnap = await this.getTournamentInfoSnap()
      if (tournamentInfoSnap.exists) {
        const tournamentInfo = tournamentInfoSnap.data()
        deck_card = Object.assign({}, deck_card, {
          tournamentName: tournamentInfo.tournamentName,
          tournamentPlayer: tournamentInfo.tournamentPlayer
        });
      }
    }
    var deck_obj = {}
    if (publicDeckSnap.exists) {
      deck_obj = publicDeckSnap.data()
    } else {
      // 未作成の場合
      deck_obj = {
        deck_id: this.deckId,
        user_name: '名無しの旅人',
        publish_status: deck_card.publish_status,
        deck_type_id: deck_card[`${categoryName}_deck_type_id`],
        views: 0,
        favo: 0
      }
      const deckObjResult = await this.getGachiMatomeBaseRef()
          .doc(this.deckId)
          .set(deck_obj)
    }
    // 登録デッキの場合
    const deck_type_name = await this.getDeckTypeName(deck_card[`${categoryName}_deck_type_id`])
    // 大会名取得
    const getTournamentName = (deck) => {
      if (deck.hasOwnProperty('tournamentName')) {
        return deck.tournamenName
      } else {
        return ''
      }
    }
    // 大会選手名取得
    const getTournamentPlayer = (deck) => {
      const user_name = deck.user_name === null ? '' : deck.user_name
      if (deck.hasOwnProperty('tournamentPlayer')) {
        return deck.tournamenPlayer
      } else {
        return deck.user_name
      }
    }
    const deck_add_obj = {
      legend: deck_card.legend,
      regulationName: getRegulationName(categoryName, deck_card.regulation_type),
      deckId: deck_obj.deck_id,
      thumbUrl: getImageUrl(deck_card.thumbnail_url),
      updatedAt: deck_card.updated_at,
      tournamentName: getTournamentName(deck_card),
      name : deck_card.name,
      deckName : deck_card.name,
      deckThemeName: deck_type_name,
      tournamentPlayer: getTournamentPlayer(deck_card),
      playerName: deck_obj.user_name === null ? '' : deck_obj.user_name,
      views: deck_obj.views,
      favo: deck_obj.favo
    }
    this.publicDeckData = Object.assign({}, deck_obj, deck_add_obj)
    let deck_card_add = {
      main: deck_card.main_cards,
      extra: deck_card.extra_cards,
      sub: deck_card.side_cards,
      gr: deck_card.gr_cards,
      chojigen: deck_card.hyper_spatial_cards,
      dorumagedon: deck_card.hasOwnProperty('dorumagedon') ? deck_card.dorumagedon : false,
      zeron: deck_card.hasOwnProperty('zeron') ? deck_card.zeron : false,
    }
    this.deckCardData = Object.assign({}, deck_card, deck_card_add)
    // カード枚数の更新
    // this.updateCardCount(this.deckCardData)
    // デッキ内のカード情報の更新
    // this.updateCards(this.deckCardData)/
  } else {
    // 未登録デッキの場合（エラー）
    alert(`登録されていない、もしくは削除されたデッキ情報です。`)
    this.hideDeckTab({}, {})
  }
}
// }}}
// {{{ DeckRecipeInfo.prototype.hideDeckTab = function(deckCardData, publicDeckData) {
DeckRecipeInfo.prototype.hideDeckTab = function(deckCardData, publicDeckData) {
  const categoryName = 'dm' // yg, dm, ygrd
  if (categoryName === 'yg') {
    if (deckCardData.extra) {
      $(`#pills-extra-tab-${this.deckId}, #pills-extradeck-${this.deckId}`).removeClass(`d-none`)
    }
    if (deckCardData.sub) {
      $(`#pills-side-tab-${this.deckId}, #pills-sidedeck-${this.deckId}`).removeClass(`d-none`)
    }
  } else if (categoryName === 'dm') {
    if (deckCardData.gr) {
      $(`#pills-gr-tab-${this.deckId}, #pills-grdeck-${this.deckId}`).removeClass(`d-none`)
    }
    if (deckCardData.chojigen) {
      $(`#pills-chojigen-tab-${this.deckId}, #pills-chojigendeck-${this.deckId}`).removeClass(`d-none`)
    }
    if (deckCardData.dorumagedon) {
      $(`#pills-dorumagedon-tab-${this.deckId}, #pills-dorumagedon-${this.deckId}`).removeClass(`d-none`)
    }
    if (deckCardData.zeron) {
      $(`#pills-zeron-tab-${this.deckId}, #pills-zeron-${this.deckId}`).removeClass(`d-none`)
    }
  } else {
  }
}
// }}}
// {{{ DeckRecipeInfo.prototype.updateCardCount = function(deckCardData) {
DeckRecipeInfo.prototype.updateCardCount = function(deckCardData) {
  const categoryName = 'dm' // yg, dm, ygrd
  $(`#maindeck-counts-${this.deckId}`).text(deckCardData.main.length)
  if (categoryName === 'yg') {
    $(`#extradeck-counts-${this.deckId}`).text(deckCardData.extra.length)
    $(`#sidedeck-counts-${this.deckId}`).text(deckCardData.sub.length)
  } else if (categoryName === 'dm') {
    $(`#grdeck-counts-${this.deckId}`).text(deckCardData.gr.length)
    $(`#chojigendeck-counts-${this.deckId}`).text(deckCardData.chojigen.length)
  } else {
  }
}
// }}}
// {{{ DeckRecipeInfo.prototype.updateCards = function(deckCardData) {
DeckRecipeInfo.prototype.updateCards = function(deckCardData) {
  $.each(deckCardData.main, this.writeCardHtml(`#pills-maindeck-${this.deckId} > div`, 'main'))
  if (deckCardData.extra) $.each(deckCardData.extra, this.writeCardHtml(`#pills-extradeck-${this.deckId} > div`, 'extra'))
  if (deckCardData.sub) $.each(deckCardData.sub, this.writeCardHtml(`#pills-sidedeck-${this.deckId} > div`, 'sub'))
  if (deckCardData.gr) $.each(deckCardData.gr, this.writeCardHtml(`#pills-grdeck-${this.deckId} > div`, 'gr'))
  if (deckCardData.chojigen) $.each(deckCardData.chojigen, this.writeCardHtml(`#pills-chojigendeck-${this.deckId} > div`, 'chojigen'))
}
// }}}
// {{{ DeckRecipeInfo.prototype.writeCardHtml = function(deckCardDomSelector, areaName) {
DeckRecipeInfo.prototype.writeCardHtml = function(deckCardDomSelector, areaName) {
  return (index, card) => {
    const cardKey = `${areaName}_${index}`
    const cardImagePathL = getImageUrlOnDetail(card.large_image_url, this.noImageUrl)
    const cardImagePathS = getImageUrlSOnDetail(card.thumbnail_url, this.noImageUrl)
    const cardName = cardKey
    $(deckCardDomSelector).append(`
<div id="card-${cardKey}-${this.deckId}" class="item8" data-toggle="modal" data-target="#expansion-${cardKey}-${this.deckId}">
  <div class="card text-white">
    <figure class="figure mb-0">
      <img src="${cardImagePathS}" alt="${cardName}" title="${cardName}" class="item8_img" data-card-key="${cardKey}-${this.deckId}" onerror="
          event.target.src = '${this.noImageUrl}'
          var cardKey = $(event.target).data('cardKey');
          if (cardKey) {
            $('#card-name-overlay-' + cardKey + '-${this.deckId}').removeClass('d-none');
          }
          console.log('card-key=' + cardKey);
      " />
    </figure>
    <div id="card-name-overlay-${cardKey}-${this.deckId}" class="card-img-overlay p-1 mb-0 d-none" style="font-size: 0.1rem;">
      ${cardName}
    </div>
  </div>
  <div class="modal fade" id="expansion-${cardKey}-${this.deckId}" tabindex="-1" role="dialog" aria-labelledby="expansionTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content border-0" style="background-color: rgba(0,0,0,0.65);">
        <div class="modal-body pb-0">
          <figure class="figure mb-0 w-100">
            <img
              src="${cardImagePathL}"
              class="d-block w-100"
              loading="lazy"
              onerror="event.target.src = '${this.noImageUrl}'"
            />
          </figure>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-secondary btn-lg btn-block" style="height: 2.5em; font-size: 1.25rem;" data-dismiss="modal">閉じる</button>
        </div>
      </div>
    </div>
  </div>
</div>`)
  }
}

DeckRecipeInfo.prototype.writeBuyCardHtml = function(setTargetDom) {
  const categoryName = 'dm'
  const gtm = location.search ? 'gtm_cardpickup_popup_gachi_recipe' : 'gtm_cardpickup_popup_gachi_article'
  const prodFlag = DECKMAKER_ENV.name === 'production' ? true : false;
  $(setTargetDom).append(`
  <script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
  <script src="https://unpkg.com/@ka-nabellinc/deck-maker-web-components@0.0.29?module"></script>
  <div class="modal fade" id="select-buy-card-modal-${this.deckId}" aria-hidden="true">
    <div class="modal-dialog-centered modal-dialog modal_height">
      <div class="modal-content border-0">
        <div style="color: black;">
          ${ categoryName === 'dm'
            ? `<dm-select-buy-card 
                dmDeckId="${this.deckId}" 
                mainCards=${JSON.stringify(this.deckCardData.main)}
                grCards=${JSON.stringify(this.deckCardData.gr)}
                hyperSpatialCards=${JSON.stringify(this.deckCardData.chojigen)}
                ${this.deckCardData.zeron ? `zeron=${this.deckCardData.zeron}` : ''}
                ${this.deckCardData.dorumagedon ? `dorumagedon=${this.deckCardData.dorumagedon}` : ''}
                ${prodFlag ? '' : 'environment=staging' }
                gtmClass="${gtm}"
                callbackUrl="${location.href}"
              ></dm-select-buy-card>` 
            : categoryName === 'yg' 
            ? `<yg-select-buy-card
                ygDeckId="${this.deckId}" 
                mainCards=${JSON.stringify(this.deckCardData.main)} 
                extraCards=${JSON.stringify(this.deckCardData.extra)}
                sideCards=${JSON.stringify(this.deckCardData.sub)}
                ${prodFlag ? '' : 'environment=staging' }
                gtmClass="${gtm}"
                callbackUrl="${location.href}"
              ></yg-select-buy-card>` 
            : null
          }
        </div>
        <div data-dismiss="modal" id="close-modal-${this.deckId}"></div>
      </div>
    </div>
  </div>
  `)
}

// }}}
// {{{ DeckRecipeInfo.prototype.loadComplete = async function() {
DeckRecipeInfo.prototype.loadComplete = async function(embedFlag) {
  const $ = jQuery.noConflict();
  const _this = this
  const categoryName = 'dm' // yg, dm, ygrd
  
  // 404エラーの画像を「NO IMAGE」に置き換えする
  $(`#pills-maindeck-${this.deckId} img`).on(`error`, (event) => {
    event.target.src = _this.noImageUrl
    const cardKey = $(event.target).data(`cardKey`)
    if (cardKey) {
      $(`#card-name-overlay-${cardKey}-${this.deckId}`).removeClass(`d-none`)
    }
  })
  const host = DECKMAKER_ENV.deckmaker_host
  // コピーボタンのイベントを設定する
  $(`#btn-copy-${this.deckId}`).on(`click`, () => {
    window.open(`${host}/${categoryName}/decks/new/?copiedfrom=${_this.deckId}`)
  })

  //デッキ購入ボタンのイベントを設定
  this.writeBuyCardHtml(`#modal-wapper-${this.deckId}`)

  // 埋め込みURL発行ボタンのイベントを設定する
  $(`#btn-embed-${this.deckId}`).on(`click`, async () => {
    const url = location.href;
    await navigator.clipboard.writeText(url);
    window.alert('クリップボードに埋め込みURLをコピーしました。')
  })

  //モーダルを閉じる
  $(`#select-buy-card-modal-${this.deckId}`).on(`cancel`, () => {
    document.getElementById(`close-modal-${this.deckId}`).click()
  })

  // 閲覧数を「+1」する（記事ではカウントしない）
  if (!embedFlag) {
    const publicDeckIncrementResult = await this.getGachiMatomeBaseRef()
      .doc(this.deckId)
      .set({ views: this.increment(1) }, { merge: true })
  }
  // 最後に関数化する
  // Cookieを取得する
  const cookies = this.getCookies()
  let isDmPubdeckFavoFlag = false
  // いいねしているかどうか判別する
  isDmPubdeckFavoFlag = this.getDmPubdeckFavoFlag(cookies)
  // Cookieの取得値がtrueだったら、いいねアイコンの色をピンク(仮)にする
  if (isDmPubdeckFavoFlag === true) {
    $(`#dm-publicdeck-${this.deckId}`).removeClass("dm-pubdeck-favoicon-default")
    $(`#dm-publicdeck-${this.deckId}`).addClass("dm-pubdeck-favoicon-favo")
  }
  // ダブルクリックなど防止するフラグ
  let isFavoProcessing = false
  // いいね!ボタンがクリックされた時の処理
  $(`#dm-publicdeck-${this.deckId}`).on(`click`, async () => {
    // isFavoProcessingをtrueにする
    isFavoProcessing = !isFavoProcessing
    // isFavoProcessingがtrueの時は、クリックイベントの処理を続ける
    if (isFavoProcessing === true) {
      // Cookieの取得値がtrueだったら、いいね数を-1
      if (isDmPubdeckFavoFlag === true) {
        const publicDeckDecrementFavoResult = await this.updatePublicDeckFavoCount(-1)
        // いいねアイコンの色を白に変える
        $(`#dm-publicdeck-${this.deckId}`).addClass("dm-pubdeck-favoicon-default")
        $(`#dm-publicdeck-${this.deckId}`).removeClass("dm-pubdeck-favoicon-favo")
        // setのあと、Cookieの値をfalseに書き換える
        document.cookie = `dm-publicdeck-${this.deckId}=false`
        isDmPubdeckFavoFlag = false
        const publicDeckSnap = await this.getPublicDeckSnap()
        // いいね数更新
        this.updateHtmlFavoCount(`#dm-pubdeck-favocount-${this.deckId}`, publicDeckSnap.data().favo)
      } else if (isDmPubdeckFavoFlag === false) {
        // Cookieの取得値がfalse(もしくは存在しない)だったら、いいね数を+1
        const publicDeckIncrementFavoResult = await this.updatePublicDeckFavoCount(1)
        // いいねアイコンの色を赤ピンク(仮)変える
        $(`#dm-publicdeck-${this.deckId}`).addClass("dm-pubdeck-favoicon-favo")
        $(`#dm-publicdeck-${this.deckId}`).removeClass("dm-pubdeck-favoicon-default")
        // setのあと、Cookieの値をtrueに書き換える
        document.cookie = `dm-publicdeck-${this.deckId}=true`
        isDmPubdeckFavoFlag = true
        const publicDeckSnap = await this.getPublicDeckSnap()
        // いいね数更新
        this.updateHtmlFavoCount(`#dm-pubdeck-favocount-${this.deckId}`, publicDeckSnap.data().favo)
      }
    }
    // isFavoProcessingをfalseにする
    isFavoProcessing = false
  })
}
// }}}

// {{{ DeckRecipeInfo.prototype.getCookies = function () {
// クッキー取得を関数化
DeckRecipeInfo.prototype.getCookies = function () {
  // Cookieを取得する
  // Cookieに複数のデータがあれば、;でsplit
  const cookies = document.cookie.split('; ')
  return cookies
}
// }}}
// {{{ DeckRecipeInfo.prototype.getDmPubdeckFavoFlag = function (cookies) {
// 取得したクッキーからいいねしているかどうかを判別する
DeckRecipeInfo.prototype.getDmPubdeckFavoFlag = function (cookies) {
  // Cookieの配列をループして、=でsplit
  // [0]がdm_pubdeck_${this.deckId}と一致しているかどうか
  // [1]の値がtrue,false(値が存在しているかはlengthで判定)
  let isDmPubdeckFavoFlag = false
  cookies.forEach(value => {
    const singleCookie = value.split('=')
    if (singleCookie[0] === `dm-publicdeck-${this.deckId}` && singleCookie[1] === 'false') {
      isDmPubdeckFavoFlag = false
    }
    else if (singleCookie[0] === `dm-publicdeck-${this.deckId}`
      && (singleCookie[1] === 'true'
      || singleCookie[1].length > 0)) {
      isDmPubdeckFavoFlag = true
    }
  })
  return isDmPubdeckFavoFlag
}
// }}}
// {{{ DeckRecipeInfo.prototype.updatePublicDeckFavoCount = async function (count) {
// いいね数の更新
DeckRecipeInfo.prototype.updatePublicDeckFavoCount = async function (count) {
  await this.getGachiMatomeBaseRef()
    .doc(this.deckId)
    // .setでfavoを-1する
    .set({ favo: this.increment(count) }, { merge: true })
}
// }}}
// {{{ DeckRecipeInfo.prototype.getPublicDeckSnap = function () {
// 更新したデッキデータを取得
DeckRecipeInfo.prototype.getPublicDeckSnap = function () {
  const publicDeckSnap = this.getGachiMatomeBaseRef()
    .doc(this.deckId)
    .get()
  return publicDeckSnap
}
// }}}
// {{{ DeckRecipeInfo.prototype.getTournamentInfoSnap = function () {
// 更新したデッキデータを取得
DeckRecipeInfo.prototype.getTournamentInfoSnap = function () {
  const snap = this.db.collection('version').doc('1')
      .collection('public_deck')
      .doc(this.deckId)
      .get()
  return snap
}
// }}}
// {{{ DeckRecipeInfo.prototype.updateHtmlFavoCount = function (tagId, count) {
// 取得したデッキデータの値に表示を更新する
DeckRecipeInfo.prototype.updateHtmlFavoCount = function (tagId, count) {
  const $ = jQuery.noConflict();
  if (count >= 0)
    $(`${tagId}`).text(count)
  else $(`${tagId}`).text('0')
}
// }}}

// {{{ DeckRecipeInfo.prototype.getDeckCardsBaseRef = function () {
// Firestore用ベース部分のDocumentReferenceを取得
DeckRecipeInfo.prototype.getDeckCardsBaseRef = function () {
  const categoryName = 'dm' // yg, dm, ygrd
  return this.db
      .collection('version')
      .doc('2')
      .collection(`${categoryName}_decks`)
}
// }}}
// {{{ DeckRecipeInfo.prototype.getDeckTypeName = async function (deckTypeId) {
// Firestoreからテーマ名を取得
DeckRecipeInfo.prototype.getDeckTypeName = async function (deckTypeId) {
  const categoryName = 'dm' // yg, dm, ygrd
  const snap = await this.db
      .collection('version')
      .doc('2')
      .collection(`${categoryName}_deck_types`)
      .doc(deckTypeId)
      .get()
  if (snap.exists) {
    return snap.data().name
  } else {
    return ''
  }
}
// }}}
// {{{ DeckRecipeInfo.prototype.getGachiMatomeBaseRef = function () {
// Firestore用ベース部分のDocumentReferenceを取得
DeckRecipeInfo.prototype.getGachiMatomeBaseRef = function () {
  const categoryName = 'dm' // yg, dm, ygrd
  return this.db
      .collection('version')
      .doc('2')
      .collection('gachi_matome')
      .doc('deck_recipes')
      .collection(`${categoryName}_deck_recipes`)
}
// }}}
// {{{ DeckRecipeInfo.prototype.getGachiMatomeStatsRef = function () {
// Firestore用ベース部分のDocumentReferenceを取得
DeckRecipeInfo.prototype.getGachiMatomeStatsRef = function () {
  const categoryName = 'dm' // yg, dm, ygrd
  return this.db
      .collection('version')
      .doc('2')
      .collection('gachi_matome')
      .doc('stats')
      .collection(`num_of_${categoryName}_deck_types_used`)
}
// }}}
