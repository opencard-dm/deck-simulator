import { chromium } from 'playwright-chromium'

/** @type {import('playwright-chromium').BrowserContext} */
let context = null
async function getContext() {
  if (!context || !context.browser()) {
    let userDir = './cache/browser'
    if (process.platform === 'win32') {
      // プロファイル名は'Safe Browsing'になるみたい
      userDir = '%LocalAppData%\\Google\\Chrome\\User Data\\'
    }
    context = await chromium.launchPersistentContext(userDir, {
      // headless: false,
    });
  }
  return context
}

let page = null
export async function getPage() {
  let pageContext = await getContext()
  try {
    page = pageContext.newPage()
  } catch (error) {
    // リトライ
    await pageContext.close()
    context = null // global
    console.log('retry getContext()')
    pageContext = await getContext()
    page = await pageContext.newPage()
  }
  return page
}