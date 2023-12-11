
import { io } from 'socket.io-client'

export class SocketUtil {
  /** @type {import('socket.io-client').Socket} */
  static socket = null
  static connect() {
    this.socket = io('', {
      transports: [ "websocket", "polling" ],
      withCredentials: true,
    })
    this.socket.on("connect", () => {
      console.debug('Socket ID', this.socket.id)
    });
  }
}
