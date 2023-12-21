// {{{ utils getCategoryId(type), isYugioh(categoryId), isDM(categoryId), getCategoryName(categoryId)
// カテゴリIDを取得する
const getCategoryId = type => (type === `yg` ? 1 : type ===`dm` ? 2 : 3)
// カテゴリIDを判定する
const isYugioh = categoryId => (categoryId === 1)
const isDM = categoryId => (categoryId === 2)
const isYugiohRd = categoryId => (categoryId === 3)
const getCategoryName = categoryId => (categoryId === 1 ? 'yg' : categoryId === 2 ? 'dm' : categoryId === 3 ? 'ygrd' : '')
// }}}
// {{{ const convertYearMonthDate = (date) => {
// 日付を表示用の文字列へ変換するメソッド
const convertYearMonthDate = (date) => {
  // const day = ['Sun', 'Mon', 'The', 'Wed', 'Thu', 'Fri', 'Sat'][
  //   date.getDay()
  // ]
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` // ${day}
}
// }}}
// {{{ const convertYearMonthDateString = (dateString) => {
// 日付（文字列）を表示用の文字列へ変換するメソッド
const convertYearMonthDateString = (dateString) => {
  return convertYearMonthDate(new Date(dateString))
}
// }}}
// {{{ const convertYearMonthDateTimestamp = (updatedAt) => {
// 日付（Timestamp）を表示用の文字列へ変換するメソッド
const convertYearMonthDateTimestamp = (updatedAt) => {
  const date = new Date(0)
  date.setSeconds(updatedAt.seconds)
  // console.log(date, updatedAt)
  return convertYearMonthDate(date)
}
// }}}
// {{{ const getRegulationName = (type, regulationType) => {
export const getRegulationName = (type, regulationType) => {
  switch (regulationType) {
    case 'original':
      return 'オリジナル'
      break;
    case 'advance':
      return 'アドバンス'
      break;
    case '2block':
      return '２ブロック'
      break;
    case 'party':
      return 'デュエパーティー'
      break;
    case 'limit':
      return 'リミットレギュレーション' 
      break;
    case 'masterDuel':
      return 'マスターデュエル'
      break;
    case 'none':
      if (type === 'yg') {
        return 'ノーリミット'
      } else if (type === 'dm') {
        return '殿堂ゼロ'
      }
      break;
    default:
      return ''
  }
}
// }}}
// {{{ const getImageUrl = (path) => {
export const getImageUrl = (path) => {
  let pathStr = ''
  if (path===null) {
    pathStr = ''
  } else {
    pathStr = path
  }
  if (pathStr.startsWith('http')) {
    return pathStr
  } else if (pathStr.startsWith('/card')) {
    let path_norm = pathStr.replaceAll('/card', 'card')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else if (pathStr.startsWith('card/')) {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/${path_norm}`
  } else if (pathStr.startsWith('/deckmaker/')) {
    let path_norm = pathStr.replaceAll('/deckmaker/', 'deckmaker/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/${path_norm}`
  } else {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/card/${path_norm}`
  }
}
// }}}
// {{{ const getImageUrlS = (path) => {
const getImageUrlS = (path) => {
  let pathStr = ''
  if (path===null) {
    pathStr = ''
  } else {
    pathStr = path
  }
  if (pathStr.startsWith('http')) {
    return pathStr
  } else if (pathStr.startsWith('/card')) {
    let path_norm = pathStr.replaceAll('/card', 'card')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else if (pathStr.startsWith('card/')) {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else if (pathStr.startsWith('/deckmaker/')) {
    let path_norm = pathStr.replaceAll('/deckmaker/', 'deckmaker/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/${path_norm}`
  } else {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/card/${path_norm}`
  }
}
// }}}
// {{{ const getImageUrlOnDetail = (path, noImage) => {
const getImageUrlOnDetail = (path, noImage) => {
  let pathStr = ''
  if (path===null) {
    pathStr = noImage
  } else {
    pathStr = path
  }
  if (pathStr.startsWith('http')) {
    return pathStr
  } else if (pathStr.startsWith('/card')) {
    let path_norm = pathStr.replaceAll('/card', 'card')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else if (pathStr.startsWith('card/')) {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/${path_norm}`
  } else if (pathStr.startsWith('/deckmaker/')) {
    let path_norm = pathStr.replaceAll('/deckmaker/', 'deckmaker/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/${path_norm}`
  } else {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/card/${path_norm}`
  }
}
// }}}
// {{{ const getImageUrlSOnDetail = (path, noImage) => {
const getImageUrlSOnDetail = (path, noImage) => {
  let pathStr = ''
  if (path===null) {
    pathStr = noImage
  } else {
    pathStr = path
  }
  if (pathStr.startsWith('http')) {
    return pathStr
  } else if (pathStr.startsWith('/card')) {
    let path_norm = pathStr.replaceAll('/card', 'card')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else if (pathStr.startsWith('card/')) {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else if (pathStr.startsWith('/deckmaker/')) {
    let path_norm = pathStr.replaceAll('/deckmaker/', 'deckmaker/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/${path_norm}`
  } else {
    let path_norm = pathStr.replaceAll('//', '/')
    return `https://storage.googleapis.com/ka-nabell-card-images/img/s/card/${path_norm}`
  }
}
// }}}

const simulateDeckPrice = (categoryId, deckCardData, href, pathname, search) => {

  //ゼーロンとドルマゲドンのメインカードID
  const DM_DORUMAGEDON_MAIN_CARD_ID = 28303;
  const DM_ZERON_MAIN_CARD_ID = 142266;

  //YG
  if (categoryId === 1) {
    const paramsBase = {
      act: navigator.userAgent.match(/iPhone|Android/) ? 'sp_sell_deck_cards' : 'sell_deck_cards',
      genre: '1',
      new: '1',
      yg_deck_id: deckCardData.yg_deck_id,
      callbackUrl: encodeURI(href),
  
      //FIXME　UTMタグを追加する
      utm_source: search ? 'gachimatome_deckrecipe' : 'gachimatome_article',
      utm_medium: 'button',
      utm_campaign: search ? `yg_id_${deckCardData.yg_deck_id}` : pathname,
    };

    const paramsObj = Object.entries(paramsBase).map(([key, val]) => `${key}=${val}`);

    const mainCards = deckCardData.main_cards;
    const extraCards = deckCardData.extra_cards;
    const sideCards  = deckCardData.side_cards;

    if (mainCards.length) {
      const val = mainCards.map((card) => card.main_card_id).join(',');
      paramsObj.push(`main_deck=${val}`);
    }

    if (extraCards.length) {
      const val = extraCards.map((card) => card.main_card_id).join(',');
      paramsObj.push(`extra_deck=${val}`);
    }

    if (sideCards.length) {
      const val = sideCards.map((card) => card.main_card_id).join(',');
      paramsObj.push(`side_deck=${val}`);
    }

    const url = navigator.userAgent.match(/iPhone|Android/) ? `${DECKMAKER_ENV.ec_url}/sp/?${paramsObj.join('&')}` : `${DECKMAKER_ENV.ec_url}/?${paramsObj.join('&')}` ;

    return url
  }
  //DM
  else if (categoryId === 2){
    const paramsBase = {
      act: navigator.userAgent.match(/iPhone|Android/) ? 'sp_sell_deck_cards' : 'sell_deck_cards',
      genre: '7',
      new: '1',
      dm_deck_id: deckCardData.dm_deck_id,
      callbackUrl: encodeURI(href),

      //FIXME　UTMタグを追加する
      utm_source: search ? 'gachimatome_deckrecipe' : 'gachimatome_article',
      utm_medium: 'button',
      utm_campaign: search ? `dm_id_${deckCardData.dm_deck_id}` : pathname,
    };

    const paramsObj = Object.entries(paramsBase).map(([key, val]) => `${key}=${val}`);

    const mainCards = deckCardData.main_cards;
    const GRCards = deckCardData.gr_cards;
    const HyperSpatialCards = deckCardData.hyper_spatial_cards;
    const zeron = deckCardData.zeron;
    const dorumagedon = deckCardData.dorumagedon;

    if (mainCards.length) {
      const val = mainCards.map((card) => card.main_card_id).join(',');
      paramsObj.push(`main_deck=${val}`);
    }

    if (GRCards.length) {
      const val = GRCards.map((card) => card.main_card_id).join(',');
      paramsObj.push(`gr_deck=${val}`);
    }

    if (HyperSpatialCards.length) {
      const val = HyperSpatialCards.map((card) => card.main_card_id).join(',');
      paramsObj.push(`hyper_spatial_deck=${val}`);
    }

    if (zeron || dorumagedon) {
      const ids = [];

      if (zeron) ids.push(DM_ZERON_MAIN_CARD_ID);
      if (dorumagedon) ids.push(DM_DORUMAGEDON_MAIN_CARD_ID);

      paramsObj.push(`special_deck=${ids.join(',')}`);
    }

    const url = navigator.userAgent.match(/iPhone|Android/) ? `${DECKMAKER_ENV.ec_url}/sp/?${paramsObj.join('&')}` : `${DECKMAKER_ENV.ec_url}/?${paramsObj.join('&')}`;

    return url;
  }
}
