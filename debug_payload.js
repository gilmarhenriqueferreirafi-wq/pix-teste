function makeField(id, value) {
  const len = value.length;
  const lenText = len < 10 ? '0' + len : String(len);
  return id + lenText + value;
}
function calcCrc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc;
}
function sanitizeText(text) {
  text = text.trim().toUpperCase();
  const accents = { 'Á':'A','À':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','É':'E','È':'E','Ê':'E','Ë':'E','Í':'I','Ì':'I','Î':'I','Ï':'I','Ó':'O','Ò':'O','Ô':'O','Õ':'O','Ö':'O','Ú':'U','Ù':'U','Û':'U','Ü':'U','Ç':'C','Ñ':'N' };
  let result = '';
  for (let char of text) {
    if (accents[char]) char = accents[char];
    if (/^[A-Z0-9 \-\.\&\/\:]+$/.test(char)) result += char;
  }
  return result;
}
function createPixPayload(pixKey, receiverName, receiverCity, txid, amount) {
  receiverName = sanitizeText(receiverName);
  receiverCity = sanitizeText(receiverCity);
  const merchantAccountInfo = makeField('00', 'BR.GOV.BCB.PIX') + makeField('01', pixKey);
  let payload = '';
  payload += makeField('00', '01');
  payload += makeField('26', merchantAccountInfo);
  payload += makeField('52', '0000');
  payload += makeField('53', '986');
  if (amount.length > 0) {
    payload += makeField('54', amount);
  }
  payload += makeField('58', 'BR');
  payload += makeField('59', receiverName);
  payload += makeField('60', receiverCity);
  payload += makeField('62', makeField('05', txid));
  payload += '6304';
  const crc = calcCrc16(payload);
  const crcText = crc.toString(16).toUpperCase().padStart(4, '0');
  payload += crcText;
  return payload;
}

const fixedPixKey = '19566990669';
let pixKey = fixedPixKey;
const amount = '10.00';
const receiverName = 'Milena';
const receiverCity = 'ITATIAÇU';
let txid = 'tx' + Date.now().toString(36) + Math.random().toString(36).slice(2,10);
txid = txid.slice(0,25);
const payload = createPixPayload(pixKey, receiverName, receiverCity, txid, amount);
console.log('txid:', txid);
console.log('payload:', payload);
console.log('length:', payload.length);
console.log('crc last 4:', payload.slice(-4));
