import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(path.join(root, 'renderer', 'index.html'), 'utf8');
const app = readFileSync(path.join(root, 'renderer', 'app.js'), 'utf8');

test('every element id the renderer looks up exists in the markup or is created by app.js', () => {
  const wanted = new Set([...app.matchAll(/\$\(['"]#([\w-]+)['"]\)/g)].map(match => match[1]));
  for (const id of wanted) {
    const inMarkup = html.includes(`id="${id}"`);
    const createdByScript = app.includes(`.id='${id}'`) || app.includes(`.id = '${id}'`);
    assert.ok(inMarkup || createdByScript, `renderer looks up #${id} but nothing defines it`);
  }
});

test('filters used by the sidebar and tabs are handled by the renderer', () => {
  for (const filter of ['all', 'downloading', 'completed', 'paused', 'failed', 'queued']) {
    assert.ok(html.includes(`data-filter="${filter}"`), `missing filter button ${filter}`);
  }
  assert.match(app, /filter === 'downloading'/);
  assert.match(app, /filter === 'paused'/);
  assert.match(app, /filter === 'failed'/);
});

test('no emoji or pictograph glyphs remain in the UI sources', () => {
  const sources = [app, html, readFileSync(path.join(root, 'renderer', 'styles.css'), 'utf8'), readFileSync(path.join(root, 'extension', 'content.js'), 'utf8')];
  for (const source of sources) {
    assert.equal(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{229F}\u{229E}]/u.test(source), false);
  }
});
