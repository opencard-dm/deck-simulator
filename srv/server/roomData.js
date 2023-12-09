import { createClient } from 'redis'
import fs from 'fs'

export class RoomData {
  /** 'file'|'redis' */
  static driver = 'file'
  static redisClient = null

  static init() {
    if (this.driver === 'file') {
      fs.readdir('cache/rooms', (err, files) => {
        if (files.length > 100) {
          fs.rmdirSync('cache/rooms')
          fs.mkdirSync('cache/rooms', { recursive: true });
        }
      })
      if (!fs.existsSync('cache/rooms')){
        fs.mkdirSync('cache/rooms', { recursive: true });
      }
    }
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
    if (this.driver === 'file') {
      if (fs.existsSync(`cache/rooms/${roomId}`)) {
        return JSON.parse(fs.readFileSync(`cache/rooms/${roomId}`))
      }
      return defalut
    }
    if (this.driver === 'redis') {
      try {
        return JSON.parse(await this.redisClient.get(key))
      } catch (err) {
        if (!this.redisClient.isOpen) {
          this.redisClient.connect().catch((err) => {console.log(err)})
        }
        console.log(err)
        return defalut
      }
    }
  }

  static async setRoomCache(roomId, roomData) {
    const key = `json:room:${roomId}`
    let room = this.getRoomCache(roomId)
    room[roomData.name] = roomData
    if (this.driver === 'file') {
      try {
        fs.writeFileSync(`cache/rooms/${roomId}`, JSON.stringify(room))
      } catch (error) {
      }
    }
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
    }
  }
}

