import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL || 'redis://@localhost:6379',
})

const getRoomCache = async (roomId) => {
  try {
    const room = JSON.parse(await client.get(`json:room:${roomId}`))
    return room
  } catch (err) {
    if (!client.isOpen) {
      client.connect().catch((err) => {console.log(err)})
    }
    console.log(err)
  }
}

const setRoomCache = async (roomId, roomData) => {
  let room = JSON.parse(await client.get(`json:room:${roomId}`))
  if (!room) {
    room = { a: null, b: null }
  }
  room[roomData.name] = roomData
  // 期限は1時間に設定。
  client.multi()
    .set(`json:room:${roomId}`, JSON.stringify(room))
    .expire(`json:room:${roomId}`, 24 * 60 * 60)
    .exec()
    .catch(err => {
      console.log(err)
      if (!client.isOpen) {
        client.connect().catch((err) => {console.log(err)})
      }
    })
}

export {
  client,
  getRoomCache,
  setRoomCache,
}
