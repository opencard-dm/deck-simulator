import { isPhone } from "./Util";

export class Layout {
  static headerHeight() {
    if (isPhone()) {
      return 40
    }
    return 40
  }

  static playerZoneHeight(cardWidth) {
    if (isPhone()) {
      const height = window.innerHeight - this.headerHeight() - this.tefudaHeight(cardWidth)
      return height
    }
    return false
  }

  static tefudaHeight(cardWidth) {
    if (isPhone()) {
      return cardWidth * 2 + 40
    }
    return false
  }
}
