
const request = require('supertest');
const assert = require('assert');
const express = require('express');

import { app } from '../../srv/index.js'
it('can use esmodule', (done) => {
  request(app)
    .get('/')
    .expect(200, done)
})
