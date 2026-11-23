import test from 'node:test';
import assert from 'node:assert/strict';
import { zoneIdentifier } from '../core/engine.mjs';

test('downloads are marked as coming from the internet zone', () => {
  const text = zoneIdentifier({ url: 'https://cdn.example.com/files/setup.exe?token=secret', referer: 'https://example.com/page?id=7' });
  assert.equal(text, '[ZoneTransfer]\r\nZoneId=3\r\nReferrerUrl=https://example.com/page\r\nHostUrl=https://cdn.example.com/files/setup.exe\r\n');
  assert.doesNotMatch(text, /secret|id=7/);
});

test('zone marker still applies without usable URLs', () => {
  assert.equal(zoneIdentifier({ url: 'not a url' }), '[ZoneTransfer]\r\nZoneId=3\r\n');
});
