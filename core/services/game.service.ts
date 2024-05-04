import { Game } from "../entities/game";

export function saveGame(game: Game) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem('game', JSON.stringify({
    cardDetails: roomStore.cardDetails,
    sourceDeck: props.sourceDeck,
    players: game.players,
    histories: game.histories,
  }));
}
