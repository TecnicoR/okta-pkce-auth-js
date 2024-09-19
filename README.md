
# Okta PKCE Authentication Library

[![npm version](https://img.shields.io/npm/v/okta-pkce-auth.svg)](https://www.npmjs.com/package/okta-pkce-auth)
[![License](https://img.shields.io/npm/l/okta-pkce-auth.svg)](LICENSE)
[![Build Status](https://img.shields.io/travis/yourusername/okta-pkce-auth.svg)](https://travis-ci.org/yourusername/okta-pkce-auth)
[![Coverage Status](https://img.shields.io/coveralls/yourusername/okta-pkce-auth.svg)](https://coveralls.io/github/yourusername/okta-pkce-auth)

A lightweight and framework-agnostic library for performing OAuth 2.0 authentication with Okta using the PKCE (Proof Key for Code Exchange) flow. Suitable for use in React, Angular, or any Node.js/TypeScript project.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Initiating Authentication](#initiating-authentication)
  - [Handling Callback](#handling-callback)
  - [Refreshing Access Token](#refreshing-access-token)
- [API Reference](#api-reference)
  - [OktaAuth Class](#oktaauth-class)
    - [Constructor](#constructor)
    - [initiateAuth](#initiateauth)
    - [handleAuthCallback](#handleauthcallback)
    - [refreshAccessToken](#refreshaccesstoken)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **PKCE Flow**: Implements the OAuth 2.0 PKCE flow for enhanced security.
- **Framework-Agnostic**: Works with any JavaScript framework or plain Node.js applications.
- **TypeScript Support**: Fully typed for better developer experience.
- **Token Management**: Returns access and refresh tokens for flexible handling.

## Installation

Install the package via npm:

```bash
npm install okta-pkce-auth
```

Or via yarn:

```bash
yarn add okta-pkce-auth
```

## Getting Started

Before using this library, you need to set up an application in your Okta dashboard and obtain the following:

- **Client ID**
- **Issuer URL**
- **Redirect URI**

Ensure your Okta application is configured to use the **Authorization Code flow with PKCE**.

## Usage

### Initialization

Import the `OktaAuth` class and create an instance with your configuration:

```typescript
import { OktaAuth, AuthConfig } from 'okta-pkce-auth';

const config: AuthConfig = {
  clientId: 'YOUR_CLIENT_ID',
  issuer: 'https://YOUR_OKTA_DOMAIN.okta.com/oauth2/default',
  redirectUri: 'http://localhost:3000/callback',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
};

const oktaAuth = new OktaAuth(config);
```

### Initiating Authentication

To start the authentication process, call `initiateAuth()` and redirect the user to the returned URL:

```typescript
const authorizationUrl = await oktaAuth.initiateAuth();
window.location.href = authorizationUrl;
```

### Handling Callback

After the user logs in, Okta will redirect back to your application with query parameters. Handle the callback and exchange the authorization code for tokens:

```typescript
import { TokenResponse } from 'okta-pkce-auth';

// Parse the query parameters from the URL
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');

if (code && state) {
  try {
    const tokens: TokenResponse = await oktaAuth.handleAuthCallback({ code, state });
    // Store tokens as needed
    console.log('Tokens:', tokens);
  } catch (error) {
    console.error('Authentication error:', error);
  }
}
```

### Refreshing Access Token

To refresh the access token using a refresh token:

```typescript
const newTokens: TokenResponse = await oktaAuth.refreshAccessToken(refreshToken);
```

---

## API Reference

### OktaAuth Class

#### Constructor

Creates a new instance of `OktaAuth`.

```typescript
constructor(config: AuthConfig)
```

- **Parameters:**
  - `config` (_AuthConfig_): An object containing the authentication configuration.

**AuthConfig Interface:**

```typescript
interface AuthConfig {
  clientId: string;
  issuer: string;       // Okta issuer URL
  redirectUri: string;
  scopes: string[];     // e.g., ['openid', 'profile', 'email']
}
```

#### initiateAuth

Generates the authorization URL to initiate the authentication flow.

```typescript
async initiateAuth(): Promise<string>
```

- **Returns:** A promise that resolves to the authorization URL.

#### handleAuthCallback

Handles the callback from Okta by exchanging the authorization code for tokens.

```typescript
async handleAuthCallback(queryParams: AuthQueryParams): Promise<TokenResponse>
```

- **Parameters:**
  - `queryParams` (_AuthQueryParams_): An object containing the `code` and `state` from the callback URL.

**AuthQueryParams Interface:**

```typescript
interface AuthQueryParams {
  code: string;
  state: string;
}
```

- **Returns:** A promise that resolves to the token response.

**TokenResponse Interface:**

```typescript
interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
}
```

#### refreshAccessToken

Refreshes the access token using a refresh token.

```typescript
async refreshAccessToken(refreshToken: string): Promise<TokenResponse>
```

- **Parameters:**
  - `refreshToken` (_string_): The refresh token obtained during authentication.
- **Returns:** A promise that resolves to the new token response.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository.**

2. **Create a new feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit your changes:**

   ```bash
   git commit -m 'Add some feature'
   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a pull request.**

Please ensure all tests pass and adhere to the coding standards.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Okta Developer Documentation](https://developer.okta.com/docs/)
- Inspired by the need for a simple, reusable Okta PKCE authentication library.

---

**Note:** Replace `YOUR_CLIENT_ID` and `YOUR_OKTA_DOMAIN` with your actual Okta application credentials. Ensure that you handle tokens securely in your application.
