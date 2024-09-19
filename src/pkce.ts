/**
 * Utility functions for PKCE (Proof Key for Code Exchange) in OAuth 2.0.
 * Provides methods to generate the code verifier and code challenge using SHA-256 hashing.
 */

/**
 * Generates a code verifier for the PKCE flow.
 * @param {number} [length=128] - The length of the code verifier.
 * @returns {string} - The generated code verifier string.
 */
export function generateCodeVerifier(length = 128): string {
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let codeVerifier = '';
    const randomValues = new Uint32Array(length);

    if (typeof window !== 'undefined' && window.crypto) {
        // Browser environment
        window.crypto.getRandomValues(randomValues);
    } else {
        // Node.js environment
        const crypto = require('crypto');
        const buffer = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            randomValues[i] = buffer[i];
        }
    }

    for (let i = 0; i < length; i++) {
        codeVerifier += possibleChars.charAt(randomValues[i] % possibleChars.length);
    }
    return codeVerifier;
}

/**
 * Generates a code challenge from the code verifier using SHA-256.
 * @param {string} codeVerifier - The generated code verifier.
 * @returns {Promise<string>} - The base64-url encoded code challenge string.
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    if (!codeVerifier || codeVerifier.length === 0) {
        throw new Error('Code verifier cannot be empty.');
    }

    let digest;

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        digest = await window.crypto.subtle.digest('SHA-256', data);
    } else {
        // Node.js environment
        const crypto = require('crypto');
        digest = crypto.createHash('sha256').update(codeVerifier).digest();
    }

    return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64-url encodes a given Uint8Array.
 * @param {Uint8Array} buffer - The buffer to encode.
 * @returns {string} - The base64-url encoded string.
 */
function base64UrlEncode(buffer: Uint8Array): string {
    let base64 = '';

    if (typeof window !== 'undefined' && window.btoa) {
        // Browser environment
        base64 = window.btoa(String.fromCharCode(...buffer));
    } else {
        // Node.js environment
        base64 = Buffer.from(buffer).toString('base64');
    }

    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
