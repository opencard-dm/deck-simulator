import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { apiRouter } from './api.js'

import cors from 'cors'

function createApp(app) {
  const filedir = typeof exports === 'object'
    ? __dirname : dirname(fileURLToPath(import.meta.url))
  
  const filepath = './dist'
  
  // app.use(express.static(filepath))
  
  // cors
  // if (process.env.CLIENT_ORIGIN) {
  //   // 全てのクロスオリジンリクエストを許可する。
  //   app.use(cors())
  // }
  
  // app.get('/', function (req, res) {
  //   res.sendFile(filepath + '/index.html');
  // });
  // // /roomへの直接アクセスを許可する。
  // app.get('/room', function (req, res) {
  //   res.sendFile(filepath + '/index.html');
  // });
  // app.get('/builder', function (req, res) {
  //   res.sendFile(filepath + '/index.html');
  // });
  // app.get('/about', function (req, res) {
  //   res.sendFile(filepath + '/index.html');
  // });
  
  app.use(apiRouter)
}

export {
  createApp,
}
