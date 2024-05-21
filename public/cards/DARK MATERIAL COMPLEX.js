
/** @type {import('../../core/entities/card').CardAbility} */
const card = {
  onMovingToBattleZone({
    card
  }) {
    card.tapped = true
  },

  onTapStateChanging({
    card,
    group
  }) {
    if (!group || group.cards.length <= 8) {
      card.tapped = true
    }
  }
}

export default card
