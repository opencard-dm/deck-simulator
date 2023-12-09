import { server } from '../srv/server/app.js'
import { client as redisClient } from '../srv/server/redisClient.js';
import '../srv/server/socket-io.js'

const port = process.env.PORT || 8080;
server.listen(port, async () => {
  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err)
  });
  await redisClient.connect()
  console.log(`redis connected`)
  console.log(`listening on *:${port}`)
})

server.on('close', async () => {
  await redisClient.quit()
})
