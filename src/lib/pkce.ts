/**
 * Generates a code verifier for PKCE authentication
 * @param length Length of the code verifier (between 43-128 characters per spec)
 * @returns A random string for use as code verifier
 */
export function generateCodeVerifier(length: number = 128): string {
  // Per OAuth 2.0 PKCE spec, code verifier should be between 43-128 characters
  if (length < 43 || length > 128) {
    throw new Error('Code verifier length must be between 43 and 128 characters');
  }
  
  // Characters used are A-Z, a-z, 0-9, and the special characters: -._~
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const possibleLength = possible.length;
  
  // Generate a random string of specified length
  let text = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(randomValues[i] % possibleLength);
  }
  
  return text;
}

/**
 * Generates a code challenge from a code verifier using SHA-256
 * @param verifier The code verifier to generate the challenge from
 * @returns The code challenge as a base64url encoded string
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  if (!verifier) {
    throw new Error('Code verifier is required');
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    return base64URLEncode(digest);
  } catch (error) {
    console.error('Failed to generate code challenge:', error);
    throw new Error('Failed to generate code challenge');
  }
}

/**
 * Encodes an ArrayBuffer to a base64url string
 * @param buffer The ArrayBuffer to encode
 * @returns A base64url encoded string
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  // Convert the ArrayBuffer to a base64 string
  const base64 = btoa(
    new Uint8Array(buffer)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  
  // Convert base64 to base64url by replacing characters and removing padding
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}