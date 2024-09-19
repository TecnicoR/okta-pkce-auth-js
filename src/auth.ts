// src/auth.ts

/**
 * @module auth
 * Provides the OktaAuth class for handling OAuth 2.0 PKCE authentication flows with Okta.
 */

import {generateCodeChallenge, generateCodeVerifier} from './pkce';
import {AuthConfig, AuthQueryParams, TokenResponse} from './types';
import axios, {AxiosResponse} from 'axios';

/**
 * Class representing the Okta authentication flow using PKCE.
 */
export class OktaAuth {
    private config: AuthConfig;
    private codeVerifier: string = '';
    private state: string = '';

    /**
     * Creates an instance of OktaAuth.
     * @param {AuthConfig} config - The authentication configuration.
     */
    constructor(config: AuthConfig) {
        // Validate necessary config parameters
        if (!config.clientId || !config.issuer || !config.redirectUri || !Array.isArray(config.scopes) || config.scopes.length === 0) {
            throw new Error('Invalid configuration for OktaAuth');
        }
        this.config = config;
    }

    /**
     * Initiates the authentication flow by generating the authorization URL.
     * @returns {Promise<string>} - The authorization URL.
     */
    async initiateAuth(): Promise<string> {
        this.codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(this.codeVerifier);
        this.state = this.generateRandomString();

        // Build the authorization URL
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'code',
            scope: this.config.scopes.join(' '),
            redirect_uri: this.config.redirectUri,
            state: this.state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        return `${this.config.issuer}/v1/authorize?${params.toString()}`;
    }

    /**
     * Handles the authorization callback by exchanging the authorization code for tokens.
     * @param {AuthQueryParams} queryParams - The query parameters from the callback URL.
     * @returns {Promise<TokenResponse>} - The token response containing access and refresh tokens.
     */
    async handleAuthCallback(queryParams: AuthQueryParams): Promise<TokenResponse> {
        const { code, state } = queryParams;

        // Validate state
        if (state !== this.state) {
            throw new Error('Invalid state parameter');
        }

        const tokenUrl = `${this.config.issuer}/v1/token`;

        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.config.redirectUri,
            code_verifier: this.codeVerifier,
            client_id: this.config.clientId,
        });

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        const response: AxiosResponse<TokenResponse> = await axios.post(tokenUrl, data.toString(), {
            headers: headers,
        });

        return response.data;
    }

    /**
     * Refreshes the access token using the refresh token.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<TokenResponse>} - The new token response.
     */
    async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
        const tokenUrl = `${this.config.issuer}/v1/token`;

        const data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: this.config.scopes.join(' '),
            client_id: this.config.clientId,
        });

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        const response: AxiosResponse<TokenResponse> = await axios.post(tokenUrl, data.toString(), {
            headers: headers,
        });

        return response.data;
    }

    /**
     * Generates a random string for use in state or nonce parameters.
     * @param {number} [length=32] - The length of the random string.
     * @returns {string} - The generated random string.
     */
    private generateRandomString(length = 32): string {
        const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const randomValues = new Uint8Array(length);

        if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(randomValues);
        } else {
            const crypto = require('crypto');
            const buffer: Buffer = crypto.randomBytes(length);
            for (let i = 0; i < length; i++) {
                randomValues[i] = buffer[i];
            }
        }

        for (let i = 0; i < length; i++) {
            result += possibleChars.charAt(randomValues[i] % possibleChars.length);
        }
        return result;
    }
}
