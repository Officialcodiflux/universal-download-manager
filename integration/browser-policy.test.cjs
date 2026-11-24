const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const nsi=fs.readFileSync(path.join(__dirname,'..','build','browser-setup-helper.nsi'),'utf8');
test('installer writes forcelist policies for Chrome, Edge and Brave',()=>{
  assert.match(nsi,/POLICY_CHROME "Software\\Policies\\Google\\Chrome\\ExtensionInstallForcelist"/);
  assert.match(nsi,/POLICY_EDGE "Software\\Policies\\Microsoft\\Edge\\ExtensionInstallForcelist"/);
  assert.match(nsi,/POLICY_BRAVE "Software\\Policies\\BraveSoftware\\Brave\\ExtensionInstallForcelist"/);
  assert.match(nsi,/!insertmacro forcelistAdd "\$\{POLICY_CHROME\}"/);
  assert.match(nsi,/!insertmacro forcelistAdd "\$\{POLICY_BRAVE\}"/);
});
test('forcelist entries use the store extension ID and update URL',()=>{
  assert.match(nsi,/!define EXTENSION_ID "lpkacmofednpbgfiogbkbiifknnljiob"/);
  assert.match(nsi,/WriteRegStr HKLM "\$\{KEY\}" "UDM" "\$\{EXTENSION_ID\};\$\{UPDATE_URL\}"/);
});
test('policy writes switch to the 64-bit registry view and are removed on uninstall',()=>{
  const macro=nsi.slice(nsi.indexOf('!macro forcelistAdd'),nsi.indexOf('!macro forcelistRemove'));
  assert.match(macro,/SetRegView 64/);
  assert.match(nsi,/!insertmacro forcelistRemove "\$\{POLICY_BRAVE\}"/);
});
