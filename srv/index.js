// import socketIO from "socket.io";
import express from 'express';
import { createApp } from './server/app.js'
import { RoomData } from './server/roomData.js';
import { attachSocketIo } from './server/socket-io.js'

/**
 * @param 
 * @link /node_modules/vue-cli-plugin-express/src/server.js
 */
export default (
  /** @type {import('express').Express} */ app, 
  /** @type {import('http').Server} */ http) => {
  app.use(express.json())
  app.use(function(req, res, next) {
    if (req.hostname !== 'deck-simulator.com') {
      // res.setHeader('X-Robots-Tag', 'noindex')
      res.setHeader('Link', '<https://deck-simulator.com>; rel="canonical"')
    }
    next();
  });
  RoomData.init()
  attachSocketIo(http)
  createApp(app)

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
