// Google Apps Script: ใช้ Google Sheet เป็นฐานข้อมูลของ Consignment Verification
// วางโค้ดนี้ใน Extensions > Apps Script ของ Google Sheet แล้ว Deploy เป็น Web app (New version)
var SHEET = 'saved';
var HEAD = ['key','hn','pname','date','code','item','qty','cost','src','vendor','po','has','by','at','ref'];

function sh_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (s.getLastRow() === 0) { s.appendRow(HEAD); s.setFrozenRows(1); }
  else if (s.getRange(1, HEAD.length).getValue() !== 'ref') { s.getRange(1, 1, 1, HEAD.length).setValues([HEAD]); }
  return s;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function read_() {
  var s = sh_(), n = s.getLastRow();
  if (n < 2) return [];
  return s.getRange(2, 1, n - 1, HEAD.length).getValues().map(function (r) {
    var o = {}; HEAD.forEach(function (h, i) { o[h] = r[i]; });
    o.has = o.has === true || o.has === 'TRUE' || o.has === 'true';
    o.date = o.date instanceof Date ? Utilities.formatDate(o.date, 'GMT+7', 'yyyy-MM-dd') : String(o.date);
    o.hn = String(o.hn); o.code = String(o.code); o.po = String(o.po); o.ref = String(o.ref || '');
    return o;
  });
}
function doGet() { return out_({ ok: true, rows: read_() }); }

function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var b = JSON.parse(e.postData.contents), s = sh_();
    var keys = {}, n = s.getLastRow(), maxRef = 0, newRef = '';
    if (n > 1) {
      s.getRange(2, 1, n - 1, 1).getValues().forEach(function (r, i) { keys[r[0]] = i + 2; });
      s.getRange(2, HEAD.length, n - 1, 1).getValues().forEach(function (r) { var v = parseInt(String(r[0]).replace(/\D/g, ''), 10); if (v > maxRef) maxRef = v; });
    }
    if (b.action === 'upsert') {
      if (b.batchRef) newRef = 'C' + ('0000' + (maxRef + 1)).slice(-4).replace(/^0+(?=\d{4})/, '');
      if (b.batchRef && (maxRef + 1) > 9999) newRef = 'C' + (maxRef + 1);
      b.rows.forEach(function (r) {
        if (b.batchRef && !keys[r.key]) r.ref = newRef;
        var line = HEAD.map(function (h) { return h === 'hn' || h === 'code' || h === 'po' || h === 'date' ? "'" + (r[h] == null ? '' : r[h]) : (r[h] == null ? '' : r[h]); });
        if (keys[r.key]) s.getRange(keys[r.key], 1, 1, HEAD.length).setValues([line]);
        else { s.appendRow(line); keys[r.key] = s.getLastRow(); }
      });
    } else if (b.action === 'delete') {
      b.keys.map(function (k) { return keys[k]; }).filter(Boolean).sort(function (a, c) { return c - a; }).forEach(function (row) { s.deleteRow(row); });
    } else if (b.action === 'clear') {
      if (n > 1) s.deleteRows(2, n - 1);
    }
    return out_({ ok: true, ref: newRef, rows: read_() });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
