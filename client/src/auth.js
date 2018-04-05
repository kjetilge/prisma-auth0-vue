import auth0 from 'auth0-js'
import Vue from 'vue'
import gql from 'graphql-tag'
import apollo from '@/apolloProvider'
import { client } from '@/apolloProvider'
import { AUTH_CONFIG } from './auth0-variables'
import Auth0Lock from 'auth0-lock'
const AUTHENTICATE = gql`
    mutation authenticate($idToken: String!) {
        authenticate(idToken: $idToken) {
            id
            name
            email
        }
    }
`
// Id token is used when creating a new user in prisma or when authentication to the prisma api
// The accessToken is used when making requests to the api.
// The access token is a jwt token that also can contain scopes and roles etc. that can be used for permissions.

const lock = new Auth0Lock(AUTH_CONFIG.clientId, AUTH_CONFIG.domain, {
  oidcConformant: true,
  autoclose: true,
  // language: 'no',
  auth: {
    sso: false,
    redirectUrl: AUTH_CONFIG.callbackUrl,
    responseType: 'token id_token',
    audience: `${AUTH_CONFIG.api_audience}`,
    params: {
      scope: `openid email user_metadata app_metadata picture`
    }
  },
})

const auth = new Vue({
  methods: {
    login () {
      console.log('lock sAuthenticated', this.isAuthenticated)
      lock.show()
    },
    test () {
      alert("TESTING")
    },
    handleAuthentication(cb) {
        console.log('handleAuthentication..')
        lock.on('authenticated', (authResult) => {
          console.log('lock result', authResult)
          if (authResult && authResult.accessToken && authResult.idToken) {
            // set authResult values in localStorage
            const expiresAt = JSON.stringify(
                authResult.expiresIn * 1000 + new Date().getTime()
            )
            this.expiresAt = authResult.expiresIn
            this.accessToken = authResult.accessToken
            this.token = authResult.idToken
            this.user = authResult.idTokenPayload
            const data = {
              status: `success`,
              accessToken: authResult.accessToken,
              idToken: authResult.idToken,
              expiresAt
            }
            //synchronize user info to prisma db
            this.signinOrCreateAccount({...data})
            // Pass authResult values too caller (callback)
            cb(authResult)
          }
        })

        lock.on('authorization_error', err => {
          console.log(err)
          alert(`Error: ${err.error}. Check the console for further details.`)
          const data = { status: `error`, errMessage: err.error }
          cb(data)
        })
    },
    signinOrCreateAccount({ accessToken, idToken, expiresAt }) {
      console.log("idToken", idToken)
      client
          .mutate({
            mutation: AUTHENTICATE,
            variables: { idToken } //
          })
          .then(res => {
            console.log("mutate result", res)
            if (window.location.href.includes(`callback`)) {
              window.location.href = '/'
            } else {
              window.location.reload()
            }
          }).catch(err => {
            alert('Sign in or create account error: ', err)
            console.log('Sign in or create account error: ', err)
            // Delete app data here
          })
    },
    logout() {
      // Clear access token and ID token from local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('id_token')
      localStorage.removeItem('expires_at')
      window.location.reload()
    }
  },
  computed: {
    isAuthenticated: {
      get: function () {
        return new Date().getTime() < this.expiresAt
      }
    },
    token: {
      get: function() {
        return localStorage.getItem('id_token')
      },
      set: function(id_token) {
        localStorage.setItem('id_token', id_token)
      }
    },
    accessToken: {
      get: function() {
        return localStorage.getItem('access_token')
      },
      set: function(accessToken) {
        console.log("SETTING accessToken:", accessToken)
        localStorage.setItem('access_token', accessToken)
      }
    },
    expiresAt: {
      get: function() {
        return localStorage.getItem('expires_at')
      },
      set: function(expiresIn) {
        let expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime())
        localStorage.setItem('expires_at', expiresAt)
      }
    },
    user: {
      get: function() {
        return JSON.parse(localStorage.getItem('user'))
      },
      set: function(user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
  },
})

export default {
  install: function(Vue) {
    Vue.prototype.$auth = auth
  }
}
