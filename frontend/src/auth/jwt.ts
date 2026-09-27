export type JwtClaims = {
  sub?: string;
  email?: string;
  domainUserId?: string;
  exp?: number;
};

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null;

  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload));
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as JwtClaims;
  } catch {
    return null;
  }
}

export function isExpired(claims: JwtClaims | null, skewSeconds = 10): boolean {
  if (!claims || typeof claims.exp !== 'number') return false;
  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
