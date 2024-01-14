import { apiRouter } from './api.js'
import express from 'express'

import cors from 'cors'

function createApp(app) {

  if (process.env.NODE_ENV !== 'development') {

    const filepath = process.cwd() + '/dist'

    app.use(express.static(filepath))
    
    cors
    if (process.env.CLIENT_ORIGIN) {
      // 全てのクロスオリジンリクエストを許可する。
      app.use(cors())
    }
    
    app.get('/', function (req, res) {
      res.sendFile(filepath + '/index.html');
    });
    // vue-router対応
    app.get('/single', function (req, res) {
      res.sendFile(filepath + '/index.html');
    });
    app.get('/room', function (req, res) {
      res.sendFile(filepath + '/index.html');
    });
    app.get('/battle', function (req, res) {
      res.sendFile(filepath + '/index.html');
    });
    app.get('/about', function (req, res) {
      res.sendFile(filepath + '/index.html');
    });
  }
  
  app.use(apiRouter)
}

export {
  createApp,
}
