// src/types.ts

/**
 * @module types
 * Provides type definitions for authentication configurations and responses.
 */

/**
 * Interface representing the authentication configuration.
 */
export interface AuthConfig {
    clientId: string;
    issuer: string;       // Okta issuer URL
    redirectUri: string;
    scopes: string[];     // e.g., ['openid', 'profile', 'email']
}

/**
 * Interface representing the query parameters from the callback URL.
 */
export interface AuthQueryParams {
    code: string;
    state: string;
}

/**
 * Interface representing the token response from the token endpoint.
 */
export interface TokenResponse {
    access_token: string;
    expires_in: number;
    id_token?: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
}
