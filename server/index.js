const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; connect-src 'self' https: http://localhost:* http://127.0.0.1:* http://[::1]:*; media-src 'self' blob:; worker-src 'self' blob:; manifest-src 'self'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), clipboard-write=(self)",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const MEDIA_UPLOAD_PATH = "/api/media";
const MEDIA_IMPORT_PATH = "/api/media/import";
const MEDIA_CHALLENGE_PATH = "/api/media/challenge";
const MEDIA_PUBLIC_PATH = "/media/";
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const MAX_CONFIGURABLE_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 8192;
const MAX_CONFIGURABLE_DIMENSION = 16384;
const DEFAULT_MAX_PIXELS = 25_000_000;
const MAX_CONFIGURABLE_PIXELS = 100_000_000;
const DEFAULT_POW_DIFFICULTY = 18;
const MIN_POW_DIFFICULTY = 12;
const MAX_POW_DIFFICULTY = 24;
const DEFAULT_CHALLENGE_TTL_SECONDS = 300;
const MIN_CHALLENGE_TTL_SECONDS = 60;
const MAX_CHALLENGE_TTL_SECONDS = 600;
const REMOTE_FETCH_TIMEOUT_MS = 10_000;
const MAX_REMOTE_REDIRECTS = 3;
const MAX_REMOTE_URL_LENGTH = 4096;

const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
};

class MediaRequestError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function parsePositiveInteger(value, fallback, maximum) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function parseRangedInteger(value, fallback, minimum, maximum) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, minimum), maximum);
}

function parseList(value) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function mediaSettings(env) {
  return {
    maxBytes: parsePositiveInteger(env.MEDIA_MAX_BYTES, DEFAULT_MAX_BYTES, MAX_CONFIGURABLE_BYTES),
    maxDimension: parsePositiveInteger(env.MEDIA_MAX_DIMENSION, DEFAULT_MAX_DIMENSION, MAX_CONFIGURABLE_DIMENSION),
    maxPixels: parsePositiveInteger(env.MEDIA_MAX_PIXELS, DEFAULT_MAX_PIXELS, MAX_CONFIGURABLE_PIXELS),
    powDifficulty: parseRangedInteger(env.MEDIA_POW_DIFFICULTY, DEFAULT_POW_DIFFICULTY, MIN_POW_DIFFICULTY, MAX_POW_DIFFICULTY),
    challengeTtlSeconds: parseRangedInteger(
      env.MEDIA_CHALLENGE_TTL_SECONDS,
      DEFAULT_CHALLENGE_TTL_SECONDS,
      MIN_CHALLENGE_TTL_SECONDS,
      MAX_CHALLENGE_TTL_SECONDS,
    ),
    allowedOrigins: parseList(env.MEDIA_CORS_ORIGINS),
    importHosts: parseList(env.MEDIA_IMPORT_HOSTS).map((host) => host.toLowerCase()),
    uploadsEnabled: env.MEDIA_UPLOAD_ENABLED === "true",
    importsEnabled: env.MEDIA_IMPORT_ENABLED === "true",
    allowAnonymousUploads: env.MEDIA_ALLOW_ANONYMOUS_UPLOADS === "true",
  };
}

function appendVary(headers, value) {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", value);
    return;
  }
  if (!existing.split(",").map((entry) => entry.trim().toLowerCase()).includes(value.toLowerCase())) {
    headers.set("Vary", `${existing}, ${value}`);
  }
}

function isAllowedCorsOrigin(origin, requestOrigin, settings) {
  return origin === requestOrigin || settings.allowedOrigins.includes(origin);
}

function apiCorsHeaders(request, url, env) {
  const origin = request.headers.get("Origin");
  const settings = mediaSettings(env);
  const headers = new Headers();

  if (origin && isAllowedCorsOrigin(origin, url.origin, settings)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Accept, Content-Type, X-Filename, Authorization, X-Media-Upload-Token, X-Media-Challenge, X-Media-Proof");
    headers.set("Access-Control-Max-Age", "600");
    appendVary(headers, "Origin");
  }

  return headers;
}

function withApiCors(response, request, url, env) {
  const headers = new Headers(response.headers);
  for (const [name, value] of apiCorsHeaders(request, url, env)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withPublicMediaCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(status, payload, headers = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(payload), { status, headers: responseHeaders });
}

function mediaError(status, code, message) {
  return jsonResponse(status, { error: { code, message } });
}

function withReleaseHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);

  if (!headers.has("Cache-Control")) {
    if (pathname.startsWith("/assets/") || pathname.startsWith(MEDIA_PUBLIC_PATH)) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (pathname === "/" || pathname.endsWith(".html") || headers.get("Content-Type")?.includes("text/html")) {
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else {
      headers.set("Cache-Control", "public, max-age=3600, must-revalidate");
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function robots(origin) {
  return `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
}

function sitemap(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc></url>
</urlset>\n`;
}

function getMediaBucket(env) {
  const bucket = env.MEDIA_BUCKET;
  return bucket && typeof bucket.get === "function" && typeof bucket.put === "function" ? bucket : null;
}

function hasConfiguredUploadToken(env) {
  return typeof env.MEDIA_UPLOAD_TOKEN === "string" && env.MEDIA_UPLOAD_TOKEN.length > 0;
}

function hasConfiguredChallengeSecret(env) {
  return typeof env.MEDIA_CHALLENGE_SECRET === "string" && env.MEDIA_CHALLENGE_SECRET.length >= 32;
}

function constantTimeEquals(expected, received) {
  if (typeof received !== "string") return false;
  const maxLength = Math.max(expected.length, received.length);
  let difference = expected.length ^ received.length;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (expected.charCodeAt(index) || 0) ^ (received.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function constantTimeBytesEqual(expected, received) {
  if (!(expected instanceof Uint8Array) || !(received instanceof Uint8Array)) return false;
  const maxLength = Math.max(expected.byteLength, received.byteLength);
  let difference = expected.byteLength ^ received.byteLength;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (expected[index] || 0) ^ (received[index] || 0);
  }
  return difference === 0;
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = `${value.replace(/-/g, "+").replace(/_/g, "/")}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hmacSha256(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function uploadTokenFrom(request) {
  const authorization = request.headers.get("Authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice("Bearer ".length);
  return request.headers.get("X-Media-Upload-Token");
}

function ensureUploadIsAllowed(request, env) {
  const settings = mediaSettings(env);
  if (!settings.uploadsEnabled) {
    throw new MediaRequestError(403, "media_uploads_disabled", "Media uploads are disabled by configuration.");
  }

  const suppliedToken = uploadTokenFrom(request);
  if (hasConfiguredUploadToken(env) && suppliedToken) {
    if (!constantTimeEquals(env.MEDIA_UPLOAD_TOKEN, suppliedToken)) {
      throw new MediaRequestError(401, "media_upload_unauthorized", "A valid media upload token is required.");
    }
    return { settings, access: "token" };
  }

  if (!settings.allowAnonymousUploads) {
    throw new MediaRequestError(
      hasConfiguredUploadToken(env) ? 401 : 403,
      hasConfiguredUploadToken(env) ? "media_upload_unauthorized" : "media_upload_auth_required",
      hasConfiguredUploadToken(env)
        ? "A valid media upload token is required."
        : "Configure an upload token or explicitly enable anonymous uploads before accepting public media.",
    );
  }

  if (!hasConfiguredChallengeSecret(env)) {
    throw new MediaRequestError(
      503,
      "media_challenge_not_configured",
      "Anonymous uploads require a server-side MEDIA_CHALLENGE_SECRET with at least 32 characters.",
    );
  }

  return { settings, access: "anonymous" };
}

function assertMediaConfigured(env) {
  const bucket = getMediaBucket(env);
  if (!bucket) {
    throw new MediaRequestError(503, "media_not_configured", "The MEDIA_BUCKET R2 binding is not configured.");
  }
  return bucket;
}

function ensureAnonymousChallengesAreAllowed(env) {
  const settings = mediaSettings(env);
  if (!settings.uploadsEnabled) {
    throw new MediaRequestError(403, "media_uploads_disabled", "Media uploads are disabled by configuration.");
  }
  if (!settings.allowAnonymousUploads) {
    throw new MediaRequestError(403, "media_anonymous_uploads_disabled", "Anonymous media uploads are disabled by configuration.");
  }
  if (!hasConfiguredChallengeSecret(env)) {
    throw new MediaRequestError(
      503,
      "media_challenge_not_configured",
      "Anonymous uploads require a server-side MEDIA_CHALLENGE_SECRET with at least 32 characters.",
    );
  }
  return settings;
}

function ensureAnonymousImportChallengesAreAllowed(env) {
  const settings = ensureAnonymousChallengesAreAllowed(env);
  if (!settings.importsEnabled) {
    throw new MediaRequestError(403, "media_imports_disabled", "Remote image imports are disabled by configuration.");
  }
  if (!settings.importHosts.length) {
    throw new MediaRequestError(503, "media_import_not_configured", "Configure MEDIA_IMPORT_HOSTS before enabling remote image imports.");
  }
  return settings;
}

function parseChallengeParameters(url, settings) {
  const digest = url.searchParams.get("sha256") || "";
  const size = url.searchParams.get("size") || "";
  if (!/^[a-f0-9]{64}$/.test(digest)) {
    throw new MediaRequestError(400, "invalid_challenge_digest", "Provide the SHA-256 digest as 64 lowercase hexadecimal characters.");
  }
  if (!/^\d+$/.test(size)) {
    throw new MediaRequestError(400, "invalid_challenge_size", "Provide the intended image size in bytes.");
  }
  const parsedSize = Number.parseInt(size, 10);
  if (!Number.isSafeInteger(parsedSize) || parsedSize < 1 || parsedSize > settings.maxBytes) {
    throw new MediaRequestError(413, "media_too_large", `Images must not exceed ${settings.maxBytes} bytes.`);
  }
  return { digest, size: parsedSize };
}

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function createAnonymousChallenge({ scope, digest, size }, settings, secret) {
  const expiresAt = nowInSeconds() + settings.challengeTtlSeconds;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = base64UrlEncode(nonceBytes);
  const payload = scope === "upload"
    ? `v1|${digest}|${size}|${expiresAt}|${settings.powDifficulty}|${nonce}`
    : `v2|${scope}|${digest}|${size}|${expiresAt}|${settings.powDifficulty}|${nonce}`;
  const signature = await hmacSha256(secret, payload);
  const challenge = `${base64UrlEncode(new TextEncoder().encode(payload))}.${base64UrlEncode(signature)}`;
  return {
    challenge,
    expiresAt,
    difficulty: settings.powDifficulty,
    algorithm: "sha256-leading-zero-bits-v1",
    scope,
  };
}

async function parseAnonymousChallenge(challenge, settings, secret) {
  if (typeof challenge !== "string" || challenge.length > 512) {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }
  const challengeParts = challenge.split(".");
  if (challengeParts.length !== 2) {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }
  const payloadBytes = base64UrlDecode(challengeParts[0]);
  const signature = base64UrlDecode(challengeParts[1]);
  if (!payloadBytes || !signature || signature.byteLength !== 32) {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }

  let payload;
  try {
    payload = new TextDecoder("utf-8", { fatal: true }).decode(payloadBytes);
  } catch {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }
  const expectedSignature = await hmacSha256(secret, payload);
  if (!constantTimeBytesEqual(expectedSignature, signature)) {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }

  const payloadParts = payload.split("|");
  let scope;
  let digest;
  let size;
  let expiresAt;
  let difficulty;
  let nonce;

  if (payloadParts[0] === "v1" && payloadParts.length === 6) {
    [, digest, size, expiresAt, difficulty, nonce] = payloadParts;
    scope = "upload";
  } else if (payloadParts[0] === "v2" && payloadParts.length === 7) {
    [, scope, digest, size, expiresAt, difficulty, nonce] = payloadParts;
  } else {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }

  if (
    (scope !== "upload" && scope !== "remote-import")
    || !/^[a-f0-9]{64}$/.test(digest)
    || !/^\d+$/.test(size)
    || !/^\d+$/.test(expiresAt)
    || !/^\d+$/.test(difficulty)
    || !/^[A-Za-z0-9_-]{20,}$/.test(nonce)
  ) {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }

  const parsedSize = Number.parseInt(size, 10);
  const parsedExpiresAt = Number.parseInt(expiresAt, 10);
  const parsedDifficulty = Number.parseInt(difficulty, 10);
  if (
    !Number.isSafeInteger(parsedSize)
    || !Number.isSafeInteger(parsedExpiresAt)
    || !Number.isSafeInteger(parsedDifficulty)
    || (scope === "upload" && parsedSize < 1)
    || (scope === "remote-import" && parsedSize !== 0)
    || parsedSize > settings.maxBytes
    || parsedDifficulty !== settings.powDifficulty
  ) {
    throw new MediaRequestError(403, "media_challenge_invalid", "A valid media challenge is required.");
  }
  if (parsedExpiresAt <= nowInSeconds()) {
    throw new MediaRequestError(403, "media_challenge_expired", "The media challenge has expired. Request a new one.");
  }

  return { scope, digest, size: parsedSize, difficulty: parsedDifficulty };
}

function hasLeadingZeroBits(bytes, bitCount) {
  const wholeBytes = Math.floor(bitCount / 8);
  const remainder = bitCount % 8;
  for (let index = 0; index < wholeBytes; index += 1) {
    if (bytes[index] !== 0) return false;
  }
  return remainder === 0 || (bytes[wholeBytes] >> (8 - remainder)) === 0;
}

async function verifyAnonymousProof(request, env, settings, expected) {
  const challenge = request.headers.get("X-Media-Challenge");
  const proof = request.headers.get("X-Media-Proof");
  if (!challenge || !proof) {
    throw new MediaRequestError(403, "media_challenge_required", "Anonymous uploads require a media challenge and proof.");
  }
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(proof)) {
    throw new MediaRequestError(403, "media_proof_invalid", "The media proof has an invalid format.");
  }

  const claims = await parseAnonymousChallenge(challenge, settings, env.MEDIA_CHALLENGE_SECRET);
  if (claims.scope !== expected.scope || claims.digest !== expected.digest || claims.size !== expected.size) {
    throw new MediaRequestError(403, "media_challenge_mismatch", "The challenge does not match the requested media.");
  }
  const proofDigest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${challenge}:${proof}`)));
  if (!hasLeadingZeroBits(proofDigest, claims.difficulty)) {
    throw new MediaRequestError(403, "media_proof_invalid", "The media proof does not satisfy the required work factor.");
  }
}

function declaredBodyIsTooLarge(request, maxBytes) {
  const header = request.headers.get("Content-Length");
  if (!header || !/^\d+$/.test(header)) return false;
  return Number.parseInt(header, 10) > maxBytes;
}

async function readLimitedStream(stream, maxBytes) {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new MediaRequestError(413, "media_too_large", `Images must not exceed ${maxBytes} bytes.`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

function isFileLike(value) {
  return value && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.size === "number";
}

async function readUploadBytes(request, maxBytes) {
  if (declaredBodyIsTooLarge(request, maxBytes)) {
    throw new MediaRequestError(413, "media_too_large", `Images must not exceed ${maxBytes} bytes.`);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.toLowerCase().startsWith("multipart/form-data")) {
    let formData;
    try {
      formData = await request.formData();
    } catch {
      throw new MediaRequestError(400, "invalid_multipart_upload", "The multipart upload body is invalid.");
    }
    const file = formData.get("file");
    if (!isFileLike(file)) {
      throw new MediaRequestError(400, "media_file_required", "Provide one image in the multipart field named file.");
    }
    if (file.size > maxBytes) {
      throw new MediaRequestError(413, "media_too_large", `Images must not exceed ${maxBytes} bytes.`);
    }
    return new Uint8Array(await file.arrayBuffer());
  }

  return readLimitedStream(request.body, maxBytes);
}

function uint16BigEndian(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function uint32BigEndian(bytes, offset) {
  return ((bytes[offset] << 24) >>> 0) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
}

function uint16LittleEndian(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function uint32LittleEndian(bytes, offset) {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + ((bytes[offset + 3] << 24) >>> 0);
}

function int32LittleEndian(bytes, offset) {
  const value = uint32LittleEndian(bytes, offset);
  return value > 0x7fffffff ? value - 0x1_0000_0000 : value;
}

function isPng(bytes) {
  return bytes.length >= 24
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a
    && bytes[12] === 0x49
    && bytes[13] === 0x48
    && bytes[14] === 0x44
    && bytes[15] === 0x52;
}

function isGif(bytes) {
  return bytes.length >= 10
    && bytes[0] === 0x47
    && bytes[1] === 0x49
    && bytes[2] === 0x46
    && bytes[3] === 0x38
    && (bytes[4] === 0x37 || bytes[4] === 0x39)
    && bytes[5] === 0x61;
}

function isWebp(bytes) {
  return bytes.length >= 16
    && bytes[0] === 0x52
    && bytes[1] === 0x49
    && bytes[2] === 0x46
    && bytes[3] === 0x46
    && bytes[8] === 0x57
    && bytes[9] === 0x45
    && bytes[10] === 0x42
    && bytes[11] === 0x50;
}

function isBmp(bytes) {
  return bytes.length >= 54 && bytes[0] === 0x42 && bytes[1] === 0x4d;
}

function sniffJpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;

  while (offset < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) return null;
    if (offset + 2 > bytes.length) return null;
    const segmentLength = uint16BigEndian(bytes, offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;

    if (startOfFrameMarkers.has(marker)) {
      if (segmentLength < 8) return null;
      return {
        width: uint16BigEndian(bytes, offset + 5),
        height: uint16BigEndian(bytes, offset + 3),
      };
    }

    offset += segmentLength;
  }

  return null;
}

function sniffWebpDimensions(bytes) {
  if (!isWebp(bytes) || bytes.length < 21) return null;
  const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (chunkType === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }

  if (chunkType === "VP8 " && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    return {
      width: uint16LittleEndian(bytes, 26) & 0x3fff,
      height: uint16LittleEndian(bytes, 28) & 0x3fff,
    };
  }

  if (chunkType === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8);
    const height = 1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10));
    return { width, height };
  }

  return null;
}

function sniffBmpDimensions(bytes) {
  if (!isBmp(bytes)) return null;

  const dibHeaderSize = uint32LittleEndian(bytes, 14);
  const pixelOffset = uint32LittleEndian(bytes, 10);
  if (dibHeaderSize < 40 || dibHeaderSize > bytes.length - 14 || pixelOffset < 14 + dibHeaderSize || pixelOffset >= bytes.length) {
    return null;
  }

  const width = int32LittleEndian(bytes, 18);
  const rawHeight = int32LittleEndian(bytes, 22);
  const planes = uint16LittleEndian(bytes, 26);
  const bitsPerPixel = uint16LittleEndian(bytes, 28);
  const compression = uint32LittleEndian(bytes, 30);
  const height = Math.abs(rawHeight);
  if (width < 1 || rawHeight === 0 || !Number.isSafeInteger(height) || planes !== 1 || ![24, 32].includes(bitsPerPixel)) {
    return null;
  }

  const usesBitfields = compression === 3;
  if (compression !== 0 && !usesBitfields) return null;
  if (usesBitfields) {
    // BI_BITFIELDS is not a compressed BMP. Permit only 32-bit images with the
    // RGB masks embedded in a V2-or-newer DIB header, and require that masks do
    // not overlap. This includes common 124-byte BITMAPV5HEADER output while
    // keeping RLE and arbitrary palette/codec variants out of the public media.
    if (bitsPerPixel !== 32 || dibHeaderSize < 52) return null;
    const redMask = uint32LittleEndian(bytes, 54);
    const greenMask = uint32LittleEndian(bytes, 58);
    const blueMask = uint32LittleEndian(bytes, 62);
    const alphaMask = dibHeaderSize >= 56 ? uint32LittleEndian(bytes, 66) : 0;
    const rgbMask = (redMask | greenMask | blueMask) >>> 0;
    if (
      !redMask
      || !greenMask
      || !blueMask
      || (redMask & greenMask) !== 0
      || (redMask & blueMask) !== 0
      || (greenMask & blueMask) !== 0
      || (alphaMask && (alphaMask & rgbMask) !== 0)
    ) {
      return null;
    }
  }

  // Accept only uncompressed true-color BMPs. This avoids handing RLE/bitfield
  // decoder complexity to readers while still covering the common "PNG URL,
  // BMP bytes" image responses seen in the wild. The single BI_BITFIELDS case
  // above is explicitly validated and is also uncompressed.
  if (width <= MAX_CONFIGURABLE_DIMENSION && height <= MAX_CONFIGURABLE_DIMENSION) {
    const rowBytes = Math.ceil((width * bitsPerPixel) / 32) * 4;
    const pixelBytes = rowBytes * height;
    if (!Number.isSafeInteger(rowBytes) || !Number.isSafeInteger(pixelBytes) || pixelOffset + pixelBytes > bytes.byteLength) {
      return null;
    }
  }

  return { width, height };
}

function sniffImage(bytes) {
  if (isPng(bytes)) {
    return { contentType: "image/png", extension: IMAGE_TYPES["image/png"], width: uint32BigEndian(bytes, 16), height: uint32BigEndian(bytes, 20) };
  }
  if (isGif(bytes)) {
    return { contentType: "image/gif", extension: IMAGE_TYPES["image/gif"], width: uint16LittleEndian(bytes, 6), height: uint16LittleEndian(bytes, 8) };
  }
  const jpeg = sniffJpegDimensions(bytes);
  if (jpeg) return { contentType: "image/jpeg", extension: IMAGE_TYPES["image/jpeg"], ...jpeg };
  const webp = sniffWebpDimensions(bytes);
  if (webp) return { contentType: "image/webp", extension: IMAGE_TYPES["image/webp"], ...webp };
  const bmp = sniffBmpDimensions(bytes);
  if (bmp) return { contentType: "image/bmp", extension: IMAGE_TYPES["image/bmp"], ...bmp };
  return null;
}

function validateImage(bytes, settings) {
  if (!bytes.byteLength) {
    throw new MediaRequestError(400, "media_file_required", "Provide a non-empty image file.");
  }
  const image = sniffImage(bytes);
  if (!image) {
    throw new MediaRequestError(415, "unsupported_media_type", "Only PNG, JPEG, GIF, WebP, and BMP raster images are accepted.");
  }
  if (!Number.isSafeInteger(image.width) || !Number.isSafeInteger(image.height) || image.width < 1 || image.height < 1) {
    throw new MediaRequestError(415, "invalid_image_dimensions", "The image has invalid dimensions.");
  }
  if (image.width > settings.maxDimension || image.height > settings.maxDimension || image.width * image.height > settings.maxPixels) {
    throw new MediaRequestError(422, "image_dimensions_exceeded", "The image dimensions exceed the configured safety limit.");
  }
  return image;
}

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function persistImage(bucket, bytes, image, origin, digest) {
  const assetKey = `${digest}.${image.extension}`;
  await bucket.put(`media/${assetKey}`, bytes, {
    httpMetadata: {
      contentType: image.contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      width: String(image.width),
      height: String(image.height),
    },
  });
  return {
    url: `${origin}${MEDIA_PUBLIC_PATH}${assetKey}`,
    key: assetKey,
    contentType: image.contentType,
    size: bytes.byteLength,
    width: image.width,
    height: image.height,
  };
}

function isIpLiteral(hostname) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
}

function isDisallowedRemoteHostname(hostname) {
  return hostname === "localhost"
    || hostname.endsWith(".localhost")
    || hostname.endsWith(".local")
    || hostname.endsWith(".internal")
    || isIpLiteral(hostname);
}

function hostnameMatchesRule(hostname, rule) {
  if (rule.startsWith("*.")) {
    const suffix = rule.slice(2);
    return hostname.endsWith(`.${suffix}`) && hostname !== suffix;
  }
  return hostname === rule;
}

function parseSafeRemoteUrl(value, importHosts) {
  if (!importHosts.length) {
    throw new MediaRequestError(503, "media_import_not_configured", "Configure MEDIA_IMPORT_HOSTS before enabling remote image imports.");
  }
  if (typeof value !== "string" || !value || value.length > MAX_REMOTE_URL_LENGTH) {
    throw new MediaRequestError(400, "invalid_remote_url", "Provide an absolute HTTPS image URL no longer than 4096 characters.");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new MediaRequestError(400, "invalid_remote_url", "Provide an absolute HTTPS image URL.");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new MediaRequestError(400, "unsafe_remote_url", "Remote imports require an HTTPS URL without credentials or a custom port.");
  }
  if (isDisallowedRemoteHostname(hostname) || !importHosts.some((rule) => hostnameMatchesRule(hostname, rule))) {
    throw new MediaRequestError(400, "remote_host_not_allowed", "The remote image host is not in MEDIA_IMPORT_HOSTS.");
  }
  // Fragments are never sent to an origin. Dropping them creates one stable
  // subject for the PoW challenge and for the subsequent server-side fetch.
  url.hostname = hostname;
  url.hash = "";
  return url;
}

async function fetchRemoteResponse(url, importHosts) {
  let target = parseSafeRemoteUrl(url, importHosts);

  for (let redirectCount = 0; redirectCount <= MAX_REMOTE_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(target, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "image/png, image/jpeg, image/gif, image/webp" },
      });
    } catch {
      throw new MediaRequestError(502, "remote_image_unavailable", "The remote image could not be fetched.");
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (!location) throw new MediaRequestError(502, "invalid_remote_redirect", "The remote image returned an invalid redirect.");
      if (redirectCount === MAX_REMOTE_REDIRECTS) {
        throw new MediaRequestError(502, "too_many_remote_redirects", "The remote image redirected too many times.");
      }
      target = parseSafeRemoteUrl(new URL(location, target).toString(), importHosts);
      continue;
    }

    if (!response.ok) {
      throw new MediaRequestError(502, "remote_image_unavailable", "The remote image returned an unsuccessful response.");
    }
    return response;
  }

  throw new MediaRequestError(502, "remote_image_unavailable", "The remote image could not be fetched.");
}

function storedContentType(object) {
  const contentType = object.httpMetadata?.contentType || object.customMetadata?.contentType;
  return Object.hasOwn(IMAGE_TYPES, contentType) ? contentType : null;
}

function assetKeyFromPath(pathname) {
  const value = pathname.slice(MEDIA_PUBLIC_PATH.length);
  return /^[a-f0-9]{64}\.(?:png|jpg|gif|webp|bmp)$/.test(value) ? value : null;
}

async function handleUpload(request, env, url) {
  const access = ensureUploadIsAllowed(request, env);
  const { settings } = access;
  const bucket = assertMediaConfigured(env);
  const bytes = await readUploadBytes(request, settings.maxBytes);
  const image = validateImage(bytes, settings);
  const digest = await sha256Hex(bytes);
  if (access.access === "anonymous") {
    await verifyAnonymousProof(request, env, settings, {
      scope: "upload",
      digest,
      size: bytes.byteLength,
    });
  }
  const asset = await persistImage(bucket, bytes, image, url.origin, digest);
  return jsonResponse(201, asset);
}

async function handleRemoteImport(request, env, url) {
  const access = ensureUploadIsAllowed(request, env);
  const { settings } = access;
  if (!settings.importsEnabled) {
    throw new MediaRequestError(403, "media_imports_disabled", "Remote image imports are disabled by configuration.");
  }
  const bucket = assertMediaConfigured(env);

  let payload;
  try {
    payload = await request.json();
  } catch {
    throw new MediaRequestError(400, "invalid_import_payload", "Provide a JSON object with an image URL.");
  }
  if (!payload || typeof payload.url !== "string") {
    throw new MediaRequestError(400, "remote_url_required", "Provide a JSON string field named url.");
  }

  const remoteUrl = parseSafeRemoteUrl(payload.url, settings.importHosts);
  if (access.access === "anonymous") {
    await verifyAnonymousProof(request, env, settings, {
      scope: "remote-import",
      digest: await sha256Hex(new TextEncoder().encode(remoteUrl.toString())),
      size: 0,
    });
  }

  const response = await fetchRemoteResponse(remoteUrl.toString(), settings.importHosts);
  if (declaredBodyIsTooLarge(response, settings.maxBytes)) {
    throw new MediaRequestError(413, "media_too_large", `Images must not exceed ${settings.maxBytes} bytes.`);
  }
  const bytes = await readLimitedStream(response.body, settings.maxBytes);
  const image = validateImage(bytes, settings);
  const asset = await persistImage(bucket, bytes, image, url.origin, await sha256Hex(bytes));
  return jsonResponse(201, asset);
}

async function handleChallenge(env, url) {
  const importUrl = url.searchParams.get("import_url");
  if (importUrl !== null) {
    if (url.searchParams.has("sha256") || url.searchParams.has("size")) {
      throw new MediaRequestError(400, "invalid_challenge_request", "Request either an upload challenge or a remote import challenge, not both.");
    }
    const settings = ensureAnonymousImportChallengesAreAllowed(env);
    assertMediaConfigured(env);
    const remoteUrl = parseSafeRemoteUrl(importUrl, settings.importHosts);
    const digest = await sha256Hex(new TextEncoder().encode(remoteUrl.toString()));
    return jsonResponse(200, await createAnonymousChallenge({
      scope: "remote-import",
      digest,
      size: 0,
    }, settings, env.MEDIA_CHALLENGE_SECRET));
  }

  const settings = ensureAnonymousChallengesAreAllowed(env);
  assertMediaConfigured(env);
  const { digest, size } = parseChallengeParameters(url, settings);
  return jsonResponse(200, await createAnonymousChallenge({
    scope: "upload",
    digest,
    size,
  }, settings, env.MEDIA_CHALLENGE_SECRET));
}

async function handlePublicAsset(env, url) {
  const bucket = assertMediaConfigured(env);
  const assetKey = assetKeyFromPath(url.pathname);
  if (!assetKey) return mediaError(404, "media_not_found", "The requested media asset does not exist.");
  const object = await bucket.get(`media/${assetKey}`);
  if (!object) return mediaError(404, "media_not_found", "The requested media asset does not exist.");
  const contentType = storedContentType(object);
  if (!contentType) return mediaError(404, "media_not_found", "The requested media asset does not exist.");

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
}

async function handleMediaRequest(request, env, url) {
  const isApi = url.pathname === MEDIA_UPLOAD_PATH || url.pathname === MEDIA_IMPORT_PATH || url.pathname === MEDIA_CHALLENGE_PATH;
  if (request.method === "OPTIONS" && isApi) {
    const origin = request.headers.get("Origin");
    if (!origin || !isAllowedCorsOrigin(origin, url.origin, mediaSettings(env))) {
      return mediaError(403, "cors_origin_not_allowed", "This origin is not allowed to call the media API.");
    }
    return new Response(null, { status: 204, headers: apiCorsHeaders(request, url, env) });
  }

  try {
    if (url.pathname === MEDIA_UPLOAD_PATH) {
      if (request.method !== "POST") return mediaError(405, "method_not_allowed", "Use POST to upload media.");
      return await handleUpload(request, env, url);
    }
    if (url.pathname === MEDIA_IMPORT_PATH) {
      if (request.method !== "POST") return mediaError(405, "method_not_allowed", "Use POST to import remote media.");
      return await handleRemoteImport(request, env, url);
    }
    if (url.pathname === MEDIA_CHALLENGE_PATH) {
      if (request.method !== "GET") return mediaError(405, "method_not_allowed", "Use GET to request a media challenge.");
      return await handleChallenge(env, url);
    }
    if (url.pathname.startsWith(MEDIA_PUBLIC_PATH)) {
      if (request.method !== "GET" && request.method !== "HEAD") return mediaError(405, "method_not_allowed", "Use GET to retrieve media.");
      const response = await handlePublicAsset(env, url);
      return request.method === "HEAD" ? new Response(null, { status: response.status, headers: response.headers }) : response;
    }
  } catch (error) {
    if (error instanceof MediaRequestError) return mediaError(error.status, error.code, error.message);
    return mediaError(500, "media_request_failed", "The media request could not be completed.");
  }

  return null;
}

export { sniffImage, validateImage };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const mediaResponse = await handleMediaRequest(request, env, url);
    if (mediaResponse) {
      const response = url.pathname.startsWith(MEDIA_PUBLIC_PATH)
        ? withPublicMediaCors(mediaResponse)
        : withApiCors(mediaResponse, request, url, env);
      return withReleaseHeaders(response, url.pathname);
    }

    if (request.method === "GET" && url.pathname === "/robots.txt") {
      return withReleaseHeaders(new Response(robots(url.origin), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }), url.pathname);
    }

    if (request.method === "GET" && url.pathname === "/sitemap.xml") {
      return withReleaseHeaders(new Response(sitemap(url.origin), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }), url.pathname);
    }

    let response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
    if (response.status === 404 && request.method === "GET" && acceptsHtml) {
      response = await env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
    }

    return withReleaseHeaders(response, url.pathname);
  },
};
