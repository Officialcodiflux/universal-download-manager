import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DownloadEngine } from '../core/engine.mjs';

test('downloads sort into category folders under the download directory by default', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'udm-category-test-'));
  const downloads = path.join(root, 'Downloads');
  const engine = await new DownloadEngine({ dataDirectory: path.join(root, 'state'), downloadDirectory: downloads }).init();
  t.after(async () => { await engine.close(); await fs.rm(root, { recursive: true, force: true }); });
  const cases = [
    ['https://example.invalid/clip.mp4', 'Video'],
    ['https://example.invalid/song.mp3', 'Music'],
    ['https://example.invalid/bundle.zip', 'Compressed'],
    ['https://example.invalid/report.pdf', 'Documents'],
    ['https://example.invalid/setup.exe', 'Programs'],
    ['https://example.invalid/readme.bin', null]
  ];
  for (const [url] of cases) await engine.add({ url, queueOnly: true });
  cases.forEach(([, folder], index) => {
    const expected = folder ? path.join(downloads, folder) : downloads;
    assert.equal(engine.downloads[index].directory, expected);
  });
});

test('a category folder chosen by the user is kept and not overwritten by defaults', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'udm-category-test-'));
  const engine = await new DownloadEngine({ dataDirectory: path.join(root, 'state'), downloadDirectory: path.join(root, 'Downloads') }).init();
  t.after(async () => { await engine.close(); await fs.rm(root, { recursive: true, force: true }); });
  const custom = path.join(root, 'MyVideos');
  await engine.updateSettings({ categoryDirectories: { Video: custom } });
  assert.equal(engine.settings.categoryDirectories.Video, custom);
  assert.equal(engine.settings.categoryDirectories.Audio, path.join(root, 'Downloads', 'Music'));
});
