export const AUTH_CONFIG = {
  domain: 'fagfilm.eu.auth0.com',
  clientID: 'fA3vcRVd3fwPmaLrgijL0SqYxp0L6wO3', // fagfilm - in use
  redirectUri: 'http://localhost:8000/callback',
  audience: 'https://fagfilm.eu.auth0.com/api/v2/',
  responseType: 'token id_token',
  scope: 'openid email name avatar'
}
