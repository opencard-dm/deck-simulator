
const request = require('supertest');
const assert = require('assert');
const express = require('express');

const app = express();

app.get('/user', function(req, res) {
  res.status(200).json({ name: 'john' });
});
it('can fetch user', (done) => {
  request(app)
    .get('/user')
    .expect('Content-Type', /json/)
    .expect('Content-Length', '15')
    .expect(200, done)
})

const serverApp = require('srv/server/index.js')
const myApp = serverApp.app
it('can use esmodule', (done) => {
  request(myApp)
    .get('/')
    .expect(200, done)
})

it('can use import.meta', () => {
  import.meta.url
})
