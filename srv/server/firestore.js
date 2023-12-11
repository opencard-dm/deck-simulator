import fs from 'fs'
// vue-cli-plugin-express の都合上cjsファイルをで読み込んでいる
const { initializeApp, cert } = require('firebase-admin/lib/app')
// use version 11.3.0 
// https://github.com/firebase/firebase-admin-node/issues/2276
const { getFirestore } = require('firebase-admin/lib/firestore')
const { Timestamp } = require('firebase-admin/lib/firestore')

let env = 'dev'
if (fs.existsSync('.credentails.json')) {
  const serviceAccount = JSON.parse(fs.readFileSync('.credentails.json', {
    encoding: 'utf8'
  }))
  initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  initializeApp();
  env = 'prod'
}

export class FireStore {
  static db = getFirestore()
  static env = env
  static Timestamp = Timestamp
}
