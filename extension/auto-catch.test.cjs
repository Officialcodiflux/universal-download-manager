const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function harness({nativeOk=true,autoCatch}={}) {
  const native=[],cancelled=[],erased=[],data={};
  if(autoCatch!==undefined)data.autoCatch=autoCatch;
  let onCreated;
  const ev={addListener(){},removeListener(){}};
  const browser={
    runtime:{id:'extension-id',onMessage:ev,onInstalled:ev,async sendNativeMessage(host,payload){native.push(structuredClone(payload));if(!nativeOk)throw new Error('Specified native messaging host not found.');return {ok:true};}},
    storage:{session:{async get(){return {};},async set(){}},local:{async get(key){return {[key]:data[key]};},async set(value){Object.assign(data,structuredClone(value));}}},
    webRequest:{onHeadersReceived:ev,onBeforeRequest:ev,onBeforeSendHeaders:ev},
    tabs:{onRemoved:ev,onUpdated:ev,async sendMessage(){return {ok:true};}},
    contextMenus:{onClicked:ev,create(){},async removeAll(){}},
    action:{async setBadgeText(){}},
    downloads:{onCreated:{addListener(fn){onCreated=fn;}},async cancel(id){cancelled.push(id);},async erase(query){erased.push(query);}}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'background.js'),'utf8'),{browser,URL,URLSearchParams,Uint8Array,btoa:value=>Buffer.from(value,'binary').toString('base64'),youtubeMedia:require('./youtube-media.js')});
  return {native,cancelled,erased,data,fire:item=>onCreated(item)};
}
test('an installer from the browser is handed to UDM and removed from browser downloads',async()=>{
  const h=harness();
  await h.fire({id:5,url:'https://github.com/Officialcodiflux/universal-download-manager/releases/download/v1.0.2/UDM-Setup.exe',referrer:'https://github.com/Officialcodiflux/universal-download-manager/releases'});
  assert.equal(h.native.length,1);
  assert.equal(h.native[0].url,'https://github.com/Officialcodiflux/universal-download-manager/releases/download/v1.0.2/UDM-Setup.exe');
  assert.equal(h.native[0].referer,'https://github.com/Officialcodiflux/universal-download-manager/releases');
  assert.deepEqual(h.cancelled,[5]);
  assert.deepEqual(h.erased.map(query=>query.id),[5]);
});
test('archives with query strings are caught too',async()=>{
  const h=harness();
  await h.fire({id:8,url:'https://example.com/files/pack.zip?token=abc'});
  assert.equal(h.native[0].url,'https://example.com/files/pack.zip?token=abc');
  assert.deepEqual(h.cancelled,[8]);
});
test('web pages stay in the browser',async()=>{
  const h=harness();
  await h.fire({id:6,url:'https://example.com/report.html'});
  assert.equal(h.native.length,0);
  assert.deepEqual(h.cancelled,[]);
});
test('turning auto-catch off leaves every download in the browser',async()=>{
  const h=harness({autoCatch:false});
  await h.fire({id:7,url:'https://example.com/setup.exe'});
  assert.equal(h.native.length,0);
  assert.deepEqual(h.cancelled,[]);
});
test('when UDM is not running the browser keeps the download',async()=>{
  const h=harness({nativeOk:false});
  await h.fire({id:9,url:'https://example.com/setup.exe'});
  assert.deepEqual(h.cancelled,[]);
  assert.match(h.data.lastError,/native messaging host/);
});
