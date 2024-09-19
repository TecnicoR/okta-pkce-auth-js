import { generateCodeVerifier, generateCodeChallenge } from '../pkce';

describe('PKCE Utilities', () => {
    test('generateCodeVerifier should generate a code verifier of default length', () => {
        const codeVerifier = generateCodeVerifier();
        expect(codeVerifier).toHaveLength(128); // Default length set to 128
    });

    test('generateCodeVerifier should generate a code verifier of specified length', () => {
        const length = 43;
        const codeVerifier = generateCodeVerifier(length);
        expect(codeVerifier).toHaveLength(length);
    });

    test('generateCodeChallenge should generate a valid code challenge', async () => {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        expect(codeChallenge).toMatch(/^[A-Za-z0-9\-_]{43,128}$/);
    });

    test('base64UrlEncode should not contain +, /, or =', async () => {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        expect(codeChallenge).not.toMatch(/[+/=]/); // Base64-url encoded should not have these characters
    });

    test('generateCodeChallenge should handle empty verifier', async () => {
        await expect(generateCodeChallenge('')).rejects.toThrow('Code verifier cannot be empty.');
    });


    test('generateCodeVerifier should generate unique verifiers', () => {
        const verifier1 = generateCodeVerifier();
        const verifier2 = generateCodeVerifier();
        expect(verifier1).not.toEqual(verifier2);
    });
});
