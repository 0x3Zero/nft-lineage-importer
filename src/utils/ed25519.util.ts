import { ed25519 } from '@noble/curves/ed25519';

/*
  All these function is taken from:
  https://github.com/Cyphrme/Ed25519Tool/blob/master/app.js#L173 
*/

/**
HexToUI8 converts string Hex to UInt8Array. 
@param   {Hex}          Hex   String Hex.
@returns {Uint8Array}         ArrayBuffer.
 */
export function hexToUint8Array(hexString: String): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const arrayBuffer = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
}

/**
    HexToUI8 converts string Hex to UInt8Array. 
    @param   {Hex}          Hex   String Hex.
    @returns {Uint8Array}         ArrayBuffer.
 */
export async function HexToUI8(hex: string) {
  if (hex === undefined) {
    // undefined is different from 0 since 0 == "AA"
    return new Uint8Array();
  }

  if (hex.length % 2 !== 0) {
    throw new RangeError('HexToUI8: Hex is not even.');
  }

  var a = new Uint8Array(hex.length / 2);
  for (var i = 0; i < hex.length; i += 2) {
    a[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  return a;
}

/**
    HexTob64ut is hex to "RFC 4648 URI Safe Truncated".  
    @param   {string} hex    Hex representation.
    @returns {string}        b64ut RFC 4648 URI safe truncated.
 */
export async function HexTob64ut(hex: string) {
  let ab = await HexToUI8(hex);
  return await ArrayBufferTo64ut(ab);
}

/**
    base64t removes base64 padding if applicable.
    @param   {string} base64 
    @returns {string} base64t
 */
export function base64t(base64: string) {
  return base64.replace(/=/g, '');
}

/**
    URIUnsafeToSafe converts any URI unsafe string to URI safe.  
    @param   {string} ub64t 
    @returns {string} b64ut 
 */
export function URIUnsafeToSafe(ub64: any) {
  return ub64.replace(/\+/g, '-').replace(/\//g, '_');
}

/**
    ArrayBufferTo64ut Array buffer to b64ut.
    @param   {ArrayBuffer}  buffer 
    @returns {string}       base64ut.
 */
export function ArrayBufferTo64ut(buffer: ArrayBuffer) {
  //@ts-ignore
  var string = String.fromCharCode.apply(null, new Uint8Array(buffer));
  return base64t(URIUnsafeToSafe(btoa(string)));
}

/**
ArrayBufferToHex accepts an array buffer and returns a string of hex.
Taken from https://stackoverflow.com/a/50767210/1923095
@param   {ArrayBuffer} buffer     Buffer that is being converted to UTF8
@returns {string}                 String with hex.
 */
export async function ArrayBufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  // Alternatively:
  // let hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
  // let hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signMessage(message: any, privateKey: Uint8Array) {
  const enc = new TextEncoder();
  const encodedMessage = new Uint8Array(enc.encode(message)); //JSON.stringify(message)));

  const signatureHex = await ArrayBufferToHex(ed25519.sign(encodedMessage, privateKey));
  const signatureBase64 = await HexTob64ut(signatureHex);

  return { hex: signatureHex, base64: signatureBase64 };
}
