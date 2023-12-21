const redis = require('redis')
const client = redis.createClient({
  url: process.env.REDIS_URL,
})

async function test1() {
  await client.connect()
  await client.set('testkey2', JSON.stringify({a: 'test'}))
  const value = JSON.parse(await client.get('testkey2'))
  console.log(value)
  // https://github.com/redis/node-redis#disconnecting
  client.quit()
}
test1()
