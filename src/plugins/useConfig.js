
function parseBool(val) {
  if (!val) {
    return false
  }
  if (val === 'false' || val === '0') {
    return false
  }
  return true
}
export const useConfig = () => {
  // クライアント側の環境変数は閲覧可能なため、秘密の情報は使ってはいけない。
  // VUE_APP_が着いているものはクライアント側で使用可能。
  return {
    IMAGE_HOST: process.env.VUE_APP_IMAGE_HOST || 'http://localhost:3000',
    WS_ENABLED: parseBool(process.env.VUE_APP_WS_ENABLED || true),
    // WebSocketのホストとapiのホストは同一の設計にしている。
    API_HOST: process.env.VUE_APP_WS_HOST || '',
  }
}
export default {
  install: (vueApp) => {
    vueApp.config.globalProperties.useConfig = useConfig
  }
}
