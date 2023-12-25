
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
    // IMAGE_HOST: import.meta.env.VUE_APP_IMAGE_HOST || 'http://localhost:3000',
    // WS_ENABLED: parseBool(import.meta.env.VUE_APP_WS_ENABLED || true),
    // WebSocketのホストとapiのホストは同一の設計にしている。
    API_HOST: '',
    // VUE_APP_API_HOST: import.meta.env.NODE_ENV === 'development' ?
    //   `http://localhost:${import.meta.env.VUE_APP_PORT}` : '',
    ENABLE_REDIS: false,
    // REDIS_URL: import.meta.env.REDIS_URL || 'redis://@localhost:6379',
  }
}
export default {
  install: (vueApp) => {
    vueApp.config.globalProperties.useConfig = useConfig
  }
}
