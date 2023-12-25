import { Server } from 'socket.io';
import { createAdapter } from "@socket.io/redis-adapter";
import { RoomData } from './roomData.js'
import { createClient } from "redis";
import { useConfig } from '../../src/plugins/useConfig.js'
import { instrument } from "@socket.io/admin-ui";

export async function attachSocketIo(appServer) {
  /** @type {import('socket.io').ServerOptions} */
  const socketIoConfig = {
      // https://socket.io/docs/v4/handling-cors/
    cors: {
      origin: [
        'http://localhost:8081',
        `http://localhost:${process.env.PORT}`,
        'https://admin.socket.io',
      ],
      credentials: true,
      methods: ["GET", "POST"],
    }
  }
  const io = new Server(socketIoConfig)
  io.attach(appServer)
  if (useConfig().ENABLE_REDIS) {
    // https://socket.io/docs/v4/redis-adapter/
    const pubClient = createClient({
      url: process.env.REDIS_URL,
    });
    const subClient = pubClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
    });
  }
  io.on('connection', function (socket) {
    socket.on('room', (roomId) => {
      socket.join('room' + roomId);
      // console.log('room'+roomId+'に入室しました')
      console.log(socket.rooms)
    })
    socket.on('leave-room', (roomId) => {
      socket.leave('room' + roomId)
      // console.log(socket.rooms)
    })
    socket.on('cards-moved', async (data) => {
      // 送信者を除いく部屋のユーザーに送信。
      socket.to('room' + data.roomId).emit('cards-moved', data)
      RoomData.setRoomCache(data.roomId, data)
    })
    socket.on("disconnect", () => {
      console.log('ソケットの接続が切断されました。')
    });
  })
}

