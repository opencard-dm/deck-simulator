// import socketIO from "socket.io";
import 'dotenv/config'
import express from 'express';
import { createApp } from './server/app.js';
import { RoomData } from './server/roomData.js';
import { attachSocketIo } from './server/socket-io.js';
import ViteExpress from "vite-express";

const app = express()
const server = app.listen(process.env.PORT, "0.0.0.0", () =>
  console.log(`Server is listening on http://localhost:${process.env.PORT}`)
);

prepareApp(app, server)
ViteExpress.bind(app, server)
/**
 * @param {import('express').Express} app 
 * @param {import('http').Server} http 
 */
function prepareApp(app, http) {
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
