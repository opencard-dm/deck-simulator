import { deckList } from '@/helpers/data'
import { Deck } from '@/helpers/Deck'
import { initialData } from './room'
import { CardActions } from './CardActions'
import { expect } from 'vitest'
import { GameLogger } from './GameLogger'
import { it } from 'vitest'

it('カードのグループ化', async () => {
  const deck = await Deck.prepareDeckForGame(
    Deck.convertGmFormat(deckList[0] as any),
    true,
    true
  )
  const players = initialData('test').players
  players.a.cards = CardActions.setupForPlayer(deck)
  
  const cardActions = new CardActions('test', players)
  const { gameLogger } = GameLogger.useGameLogger(cardActions, 'a')
  const playerCards = players.a.cards
  cardActions.moveCards({
    from: 'tefudaCards',
    to: 'battleCards',
    cards: [playerCards.tefudaCards[0]],
    player: 'a',
  })
  expect(playerCards.battleCards.length).toEqual(1)
  expect(playerCards.tefudaCards.length).toEqual(4)
  cardActions.groupCard({
    from: 'tefudaCards',
    to: 'battleCards',
    fromCard: playerCards.tefudaCards[0],
    toCard: playerCards.battleCards[0],
    player: 'a',
  })
  expect(playerCards.battleCards.length).toEqual(2)
  expect(playerCards.tefudaCards.length).toEqual(3)
  // 2023/12/24 他のゾーンからバトルゾーンに重ねようとしたカードがグループ化されない
  expect(playerCards.battleCards[0].groupId, 'カードがグループ化されていること')
    .toEqual(playerCards.battleCards[1].groupId)
  expect(playerCards.battleCards[0].groupId).toBeTruthy()
})

it('山札を裏返す、重ねる、やり直す', async () => {
  const deck = await Deck.prepareDeckForGame(
    Deck.convertGmFormat(deckList[0] as any),
    true,
    true
  )
  const players = initialData('test').players
  players.a.cards = CardActions.setupForPlayer(deck)
  
  const cardActions = new CardActions('test', players)
  const { gameLogger } = GameLogger.useGameLogger(cardActions, 'a')
  const playerCards = players.a.cards
  cardActions.moveCards({
    from: 'tefudaCards',
    to: 'battleCards',
    cards: [playerCards.tefudaCards[0]],
    player: 'a',
  })
  expect(playerCards.yamafudaCards[0].faceDown).toEqual(true)
  cardActions.changeCardsState({
    from: 'yamafudaCards',
    cards: [playerCards.yamafudaCards[0]],
    player: 'a',
    cardState: {
      faceDown: false
    }
  })
  expect(playerCards.yamafudaCards[0].faceDown).toEqual(false)
  const yamafudaTopCardId = playerCards.yamafudaCards[0].id
  console.log(yamafudaTopCardId)
  cardActions.groupCard({
    from: 'yamafudaCards',
    to: 'battleCards',
    fromCard: playerCards.yamafudaCards[0],
    toCard: playerCards.battleCards[0],
    player: 'a',
  })
  expect(playerCards.yamafudaCards[0].faceDown).toEqual(true)
  gameLogger.undo()
  expect(playerCards.yamafudaCards[0].id).toEqual(yamafudaTopCardId)
  expect(playerCards.yamafudaCards[0].faceDown, '山札の上のカードが表向き').toEqual(false)
})

it('ギャラクシールド', async () => {
  const deck = await Deck.prepareDeckForGame(
    Deck.convertGmFormat(deckList[0] as any),
    true,
    true
  )
  const players = initialData('test').players
  players.a.cards = CardActions.setupForPlayer(deck)
  
  const cardActions = new CardActions('test', players)
  const { gameLogger } = GameLogger.useGameLogger(cardActions, 'a')
  const playerCards = players.a.cards
  const firstTefudaCardId = playerCards.tefudaCards[0].id
  const firstShieldCardId = playerCards.shieldCards[0].id
  cardActions.groupCard({
    from: 'tefudaCards',
    to: 'shieldCards',
    fromCard: playerCards.tefudaCards[0],
    toCard: playerCards.shieldCards[0],
    player: 'a',
  })
  expect(playerCards.tefudaCards.length).toEqual(4)
  expect(playerCards.shieldCards.length).toEqual(6)
  expect(playerCards.shieldCards[0].id).toEqual(firstTefudaCardId)
  expect(playerCards.shieldCards[1].id).toEqual(firstShieldCardId)
  expect(playerCards.shieldCards[0].groupId).toBeTruthy()
  expect(playerCards.shieldCards[1].groupId).toBeTruthy()
  cardActions.moveCards({
    from: 'shieldCards',
    to: 'battleCards',
    cards: [playerCards.shieldCards[0]],
    player: 'a',
  })
  expect(playerCards.battleCards[0].id).toEqual(firstTefudaCardId)
  expect(playerCards.shieldCards.length).toEqual(5)
  gameLogger.undo()
  expect(playerCards.tefudaCards.length).toEqual(4)
  expect(playerCards.shieldCards.length).toEqual(6)
  expect(playerCards.shieldCards[0].id).toEqual(firstTefudaCardId)
  expect(playerCards.shieldCards[1].id).toEqual(firstShieldCardId)
  expect(playerCards.shieldCards[0].groupId).toBeTruthy()
  expect(playerCards.shieldCards[1].groupId).toBeTruthy()
})
