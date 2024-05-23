

export class StringUtil {
  static toHalfNum(text: string) {
    const fullnums = '０１２３４５６７８９'
    const reFullnums = new RegExp('['+fullnums+']','g')
    return text.replace(reFullnums, m => fullnums.indexOf(m).toString())
  }
}
