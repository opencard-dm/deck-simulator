// import { Socket, io } from 'socket.io-client'

export class SocketUtil {
  static socket = null
  static connect() {
    this.socket = io({
      transports: [ "websocket", "polling" ],
      withCredentials: true,
    })
    this.socket.on("connect", () => {
      console.debug('Socket ID', this.socket?.id)
    });
  }
}
