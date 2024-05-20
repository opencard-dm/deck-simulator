
/** @type {import('../../core/entities/card').CardAbility} */
const card = {
  onMovingToBattleZone({
    card
  }) {
    console.log(card)
    card.tapped = true
  },
}

export default card
