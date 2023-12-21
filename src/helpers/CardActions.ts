import { zone, player, zoneGroup, cardState } from "@/entities";
import { Util } from "./Util";

export class CardActions {

  /**
   * @param players reactive
   */
  constructor(
    public players: any
  ) {}

  moveCards(from: zone, to: zone, selectedCards: any[], player: player, prepend = false) {
    if (!selectedCards || selectedCards.length === 0) return;
    // 先頭のカードがグループに属していた場合、そのグループから抜ける。
    const card = selectedCards[0];
    if (card.groupId) {
      this.ungroupCard({
        zone: from,
        groupName: card.group,
        card,
        player,
      });
    }
    // 手札、マナ、墓地へ行く場合は表向きにする。
    if (
      ['tefudaCards', 'manaCards', 'bochiCards'].includes(to) &&
      to !== from
    ) {
      selectedCards.forEach((card) => {
        card.faceDown = false;
      });
    }
    // 山札へ行くときは裏向きにする。
    if (['yamafudaCards'].includes(to) && to !== from) {
      selectedCards.forEach((card) => {
        card.faceDown = true;
      });
    }
    // 違うゾーンへ移動するときはタップとマークを解除する。
    if (to !== from) {
      selectedCards.forEach((card) => {
        card.markColor = '';
        card.tapped = false;
      });
    }
    this.players[player]['cards'][from] = Util.arrayRemoveCards(
      this.players[player]['cards'][from],
      selectedCards
    );
    if (prepend) {
      this.players[player]['cards'][to] = Util.arrayPrependCards(
        this.players[player]['cards'][to],
        selectedCards
      );
    } else {
      this.players[player]['cards'][to] = Util.arrayAppendCards(
        this.players[player]['cards'][to],
        selectedCards
      );
    }
  }

  changeCardsState({ from, cards, player, cardState }: {
    from: zone,
    cards: any[],
    player: player,
    cardState: cardState,
  }) {
    const cardIds = cards.map((c) => c.id);
    this.players[player]["cards"][from].forEach((c: any) => {
      if (!cardIds.includes(c.id)) return;
      Object.keys(cardState).forEach((key) => {
        if (["tapped", "faceDown", "markColor"].includes(key)) {
          c[key] = cardState[key as keyof cardState];
        }
      });
    });
  }

  groupCard({ from, to, fromCard, toCard, player }: {
    from: zone,
    to: zone,
    fromCard: any,
    toCard: any,
    player: player,
  }) {
    // 情報をカードに追加
    // card.groupはできれば使いたくない。moveCards内でのみ使用。
    fromCard.group = to;
    toCard.group = to;
    if (toCard.groupId) {
      // ターゲットのカードが既にグループ化されていた場合、
      // 既存のグループに追加する。
      const group = this.players[player]['cards'][to].find(
        (g: any) => g.id === toCard.groupId
      );
      group.cardIds.unshift(fromCard.id);
      fromCard.groupId = toCard.groupId;
    } else {
      // 新しくグループを作成する。
      // TODO: 被らない文字列にする。
      const groupId = `${toCard.id}-${fromCard.id}`;
      this.players[player]['cards'][to].push({
        id: groupId,
        cardIds: [fromCard.id, toCard.id],
      });
      fromCard.groupId = groupId;
      toCard.groupId = groupId;
    }
    // 並べ替え
    if (['battleCardGroups', 'shieldCardGroups'].includes(to)) {
      // fromCardをtoCardの前に移す。
      Util.arrayInsertBefore(this.players[player]['cards'][from], toCard, fromCard);
    }
  }

  // groupNameはbattleCardGroupsかshieldCardGroups
  ungroupCard({ groupName, card, player, zone }: {
    groupName: zoneGroup,
    card: any,
    player: player,
    zone: zone,
  }) {
    // シールドのグループの場合はカードの行き先がわからず、注意が必要。
    const groupIndex = this.players[player]['cards'][groupName].findIndex(
      (g: any) => g.id === card.groupId
    );
    const group = this.players[player]['cards'][groupName].find(
      (g: any) => g.id === card.groupId
    );
    this.players[player]['cards'][groupName][groupIndex].cardIds.splice(
      group.cardIds.findIndex((id: string) => id === card.id),
      1
    );
    // カードが一枚だけのグループは消す。
    if (group.cardIds.length === 1) {
      const lastCardIndex = this.players[player]['cards'][zone].findIndex(
        (c: any) => c.id === group.cardIds[0]
      );
      if (lastCardIndex) {
        const lastCard = this.players[player]['cards'][zone][lastCardIndex];
        this.ungroupCard({
          groupName,
          card: lastCard,
          player,
          zone,
        });
      }
    }
    // cardIdsが0になったグループは自動で消す。
    if (group.cardIds.length === 0) {
      this.players[player]['cards'][groupName].splice(groupIndex, 1);
    }
    card.groupId = null;
    card.group = null;
  }
}