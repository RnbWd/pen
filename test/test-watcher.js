'use strict';

const assert = require('assert');
const fs = require('fs');
const helper = require('./lib/helper');
const Watcher = require('../src/watcher');

describe('Watcher', () => {
  let watcher;

  beforeEach(() => {
    helper.createFile('watcher-temp', 'hello');
  });

  afterEach(() => {
    watcher.stop();
    helper.clean();
  });

  it('reads a file', (done) => {
    watcher = new Watcher(helper.path('watcher-temp'));
    watcher
      .onData(data => {
        assert.equal(data.toString(), 'hello');
        done();
      })
      .onError(done);
  });

  it('cannot read a wrong file', (done) => {
    let watcher = new Watcher(helper.path('watcher-wrong-temp'));
    watcher
      .onData(() => {
        done('there shouldn\'t be a file!');
      })
      .onError(error => {
        assert.equal(error.code, 'ENOENT');
        done();
      });
  });

  it('send the data again when the file is updated', (done) => {
    let called = 0;
    watcher = new Watcher(helper.path('watcher-temp'));
    watcher
      .onData(data => {
        switch (called) {
        case 0:
          assert.equal(data.toString(), 'hello');
          fs.writeFile(helper.path('watcher-temp'), 'world');
          break;
        case 1:
          assert.equal(data.toString(), 'world');
          fs.writeFile(helper.path('watcher-temp'), 'pen!');
          break;
        case 2:
          assert.equal(data.toString(), 'pen!');
          done();
          break;
        }
        called += 1;
      })
      .onError(done);
  });
});
