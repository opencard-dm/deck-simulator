
import { useConfig } from '..//plugins/useConfig';
import { io } from 'socket.io-client'

export class SocketUtil {
  /** @type {import('socket.io-client').Socket} */
  static socket = null
  static connect() {
    if (useConfig().VUE_APP_API_HOST) {
      console.debug('connecting:', useConfig().VUE_APP_API_HOST)
      this.socket = io(useConfig().VUE_APP_API_HOST, {
        transports: [ "websocket" ],
        withCredentials: true,
      })
    } else {
      this.socket = io({
        transports: [ "websocket", "polling" ],
        withCredentials: true,
      })
    }
    this.socket.on("connect", () => {
      console.debug('Socket ID', this.socket.id)
    });
  }
}
