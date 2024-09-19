import { OktaAuth } from '../auth';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('OktaAuth Class', () => {
    const config = {
        clientId: 'test-client-id',
        issuer: 'https://dev-123456.okta.com/oauth2/default',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['openid', 'profile', 'email', 'offline_access'],
    };

    const oktaAuth = new OktaAuth(config);
    const mock = new MockAdapter(axios);

    afterEach(() => {
        mock.reset();
    });

    // Ensure the correct URL and data are mocked
    mock.onPost(`${config.issuer}/v1/token`, new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: '',
        scope: config.scopes.join(' '),
        client_id: config.clientId,
    }).toString()).reply(400, {
        error: "invalid_request",
        error_description: "Missing refresh token"
    });

    test('refreshAccessToken should throw error if refresh token is missing', async () => {
        await expect(oktaAuth.refreshAccessToken('')).rejects.toThrow('Request failed with status code 400');
    });

    test('initiateAuth should return a valid authorization URL', async () => {
        const authorizationUrl = await oktaAuth.initiateAuth();
        const { URL } = require('url');
        const parsedUrl = new URL(authorizationUrl);

        expect(parsedUrl.origin + parsedUrl.pathname).toBe(config.issuer + '/v1/authorize');
        expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
        expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
        expect(parsedUrl.searchParams.get('response_type')).toBe('code');
        expect(parsedUrl.searchParams.get('scope')).toBe(config.scopes.join(' '));
        expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
        expect(parsedUrl.searchParams.has('state')).toBe(true);
        expect(parsedUrl.searchParams.has('code_challenge')).toBe(true);
    });

    test('handleAuthCallback should throw error on invalid state', async () => {
        const queryParams = {
            code: 'test-code',
            state: 'invalid-state',
        };

        await expect(oktaAuth.handleAuthCallback(queryParams)).rejects.toThrow('Invalid state parameter');
    });

    test('handleAuthCallback should return tokens on valid state', async () => {
        const queryParams = {
            code: 'test-code',
            state: oktaAuth['state'],
        };

        const tokenResponse = {
            access_token: 'test-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email offline_access',
            refresh_token: 'test-refresh-token',
        };

        mock.onPost(`${config.issuer}/v1/token`).reply(200, tokenResponse);
        const tokens = await oktaAuth.handleAuthCallback(queryParams);

        expect(tokens.access_token).toBe('test-access-token');
        expect(tokens.refresh_token).toBe('test-refresh-token');
    });

    test('refreshAccessToken should return new tokens', async () => {
        const refreshToken = 'test-refresh-token';
        const tokenResponse = {
            access_token: 'new-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email offline_access',
            refresh_token: 'new-refresh-token',
        };

        mock.onPost(`${config.issuer}/v1/token`).reply(200, tokenResponse);
        const tokens = await oktaAuth.refreshAccessToken(refreshToken);

        expect(tokens.access_token).toBe('new-access-token');
        expect(tokens.refresh_token).toBe('new-refresh-token');
    });

    test('refreshAccessToken should handle 401 error from server', async () => {
        const refreshToken = 'invalid-refresh-token';
        mock.onPost(`${config.issuer}/v1/token`).reply(401, { error: 'invalid_grant' });

        await expect(oktaAuth.refreshAccessToken(refreshToken)).rejects.toThrow('Request failed with status code 401');
    });


    test('should throw error if invalid config is passed', () => {
        const invalidConfig = {
            clientId: '',
            issuer: '',
            redirectUri: '',
            scopes: [],
        };

        expect(() => new OktaAuth(invalidConfig)).toThrowError();
    });
});
