import { Game, GamePlayer } from "../entities/game";

export function saveGameTemporarily(game: Game) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem('game', JSON.stringify({
    cardDetails: game.cardDetails,
    players: game.players,
    histories: game.histories,
  }));
}

export function getTemporarilySavedGame(): Game | null {
  if (typeof sessionStorage === 'undefined') return null
  const dataString = sessionStorage.getItem('game');
  if (!dataString) return null
  const {
    cardDetails,
    players,
    histories,
  } = JSON.parse(dataString);
  const game = Game.init()
  game.cardDetails = cardDetails
  game.histories = histories
  game.players = {
    a: GamePlayer.fromData(players.a),
    b: GamePlayer.fromData(players.b),
  }
  return game
}

export function deleteTemporarilySavedGame() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem('game');
}
