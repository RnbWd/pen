'use strict';

const assert = require('assert');
const fs = require('fs');
const helper = require('./lib/helper');
const MarkdownWatcher = require('../src/markdown-watcher');

describe('MarkdownWatcher', () => {
  let watcher;

  beforeEach(() => {
    helper.createFile('watcher-temp.md', '# hello');
  });

  afterEach(() => {
    watcher.stop();
    helper.clean();
  });

  it('reads a Markdown file and send parsed HTML data', (done) => {
    watcher = new MarkdownWatcher(helper.path('watcher-temp.md'));
    watcher
      .onData(data => {
        assert.equal(data, '<h1 id="hello">hello</h1>\n');
        done();
      })
      .onError(done);
  });

  it('send parsed HTML data again when the file is updated', (done) => {
    let called = 0;
    watcher = new MarkdownWatcher(helper.path('watcher-temp.md'));
    watcher
      .onData(data => {
        switch (called) {
        case 0:
          assert.equal(data, '<h1 id="hello">hello</h1>\n');
          fs.writeFile(helper.path('watcher-temp.md'), '```js\nvar a=10;\n```');
          break;
        case 1:
          assert.equal(data, '<pre><code class="language-js">var a=10;\n</code></pre>\n');
          fs.writeFile(helper.path('watcher-temp.md'), '* nested\n  * nnested\n    * nnnested');
          break;
        case 2:
          assert.equal(data, '<ul>\n<li>nested\n<ul>\n<li>nnested\n<ul>\n<li>nnnested</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n');
          done();
          break;
        }
        called += 1;
      })
      .onError(done);
  });
});
