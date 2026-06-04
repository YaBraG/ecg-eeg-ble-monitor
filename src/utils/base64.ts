const base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function decodeBase64ToBytes(value: string) {
  const bytes: number[] = [];
  let buffer = 0;
  let bitsCollected = 0;

  for (const character of value.replace(/[^A-Za-z0-9+/=]/g, '')) {
    if (character === '=') {
      break;
    }

    const index = base64Characters.indexOf(character);
    if (index < 0) {
      continue;
    }

    buffer = (buffer << 6) | index;
    bitsCollected += 6;

    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes.push((buffer >> bitsCollected) & 0xff);
    }
  }

  return bytes;
}
