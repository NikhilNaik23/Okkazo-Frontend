const RICH_PREFIX = '__OKKAZO_RICH__:';

const bytesToBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (b64) => {
  const binary = atob(String(b64 || ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const encodeRichChatMessage = ({ kind, payload }) => {
  const k = String(kind || '').trim();
  if (!k) throw new Error('kind is required');

  const json = JSON.stringify({ v: 1, kind: k, payload: payload ?? null });
  const bytes = new TextEncoder().encode(json);
  const b64 = bytesToBase64(bytes);
  return `${RICH_PREFIX}${b64}`;
};

export const extractRichChatMessage = (text) => {
  const raw = String(text || '');
  const idx = raw.indexOf(RICH_PREFIX);
  if (idx === -1) return null;

  const after = raw.slice(idx + RICH_PREFIX.length);
  const token = after.split(/\r?\n/)[0]?.trim();
  if (!token) return null;

  try {
    const bytes = base64ToBytes(token);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);

    const kind = String(parsed?.kind || '').trim();
    if (!kind) return null;

    return {
      kind,
      payload: parsed?.payload ?? null,
      version: parsed?.v ?? 1,
    };
  } catch {
    return null;
  }
};

export const stripRichChatMessage = (text) => {
  const raw = String(text || '');
  const idx = raw.indexOf(RICH_PREFIX);
  if (idx === -1) return raw;
  return raw.slice(0, idx).trim();
};
