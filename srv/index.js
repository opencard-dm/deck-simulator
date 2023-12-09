// import socketIO from "socket.io";
import express from 'express';
import { createApp } from './server/app.js'
import { client as redisClient } from './server/redisClient.js';
import { attachSocketIo } from './server/socket-io.js'

/**
 * @param 
 */
export default (
  /** @type {import('express').Express} */ app, 
  /** @type {import('http').Server} */ http) => {
  app.use(express.json())
  attachSocketIo(http)
  createApp(app)
  // http.listen(http.Server, async () => {
  // })
  
  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err)
  });
  redisClient.connect().then(() => {
    console.log(`redis connected`)
  })
  // server.on('close', async () => {
  //   await redisClient.quit()
  // })

  // optional support for socket.io
  // 
  // let io = socketIO(http);
  // io.on("connection", client => {
  //   client.on("message", function(data) {
  //     // do something
  //   });
  //   client.emit("message", "Welcome");
  // });
}
