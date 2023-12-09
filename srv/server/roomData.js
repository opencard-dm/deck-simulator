import { createClient } from 'redis'

export class RoomData {
  /** 'memory'|'redis' */
  static driver = 'redis'
  static roomData = {}
  /** @type {[string]: NodeJS.Timeout[]} */
  static timeOuts = {}
  static redisClient = null

  static init() {
    if (this.driver === 'redis') {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://@localhost:6379',
      })
      this.redisClient.on('error', (err) => {
        console.log('Redis Client Error', err)
      });
      this.redisClient.connect().then(() => {
        console.log(`redis connected`)
      })
    }
  }

  static async getRoomCache(roomId) {
    const key = `json:room:${roomId}`
    const defalut = { a: null, b: null }
    if (this.driver === 'redis') {
      try {
        const room = JSON.parse(await this.redisClient.get(key))
        return room
      } catch (err) {
        if (!this.redisClient.isOpen) {
          this.redisClient.connect().catch((err) => {console.log(err)})
        }
        console.log(err)
        return defalut
      }
    } else {
      if (key in this.roomData) {
        return this.roomData[key]
      }
      return defalut
    }
  }

  static async setRoomCache(roomId, roomData) {
    const key = `json:room:${roomId}`
    let room = this.getRoomCache(roomId)
    room[roomData.name] = roomData
    if (this.driver === 'redis') {
      this.redisClient.multi()
        .set(key, JSON.stringify(room))
        .expire(key, 60 * 60) // 1時間
        .exec()
        .catch(err => {
          console.log(err)
          if (!this.redisClient.isOpen) {
            this.redisClient.connect().catch((err) => {console.log(err)})
          }
        })
    } else {
      this.roomData[key] = room
      if (key in this.timeOuts) {
        try {
          this.timeOuts[key].forEach(t => clearTimeout(t))
        } catch (error) {}
      }
      this.timeOuts[key] = [setTimeout(() => {
        delete this.roomData[key]
        delete this.timeOuts[key]
      }, 60 * 60 * 1000)];
    }
  }
}

