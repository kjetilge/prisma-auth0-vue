import auth0 from 'auth0-js'
import Vue from 'vue'
import gql from 'graphql-tag'
import apollo from '@/apolloProvider'
import { client } from '@/apolloProvider'
import { AUTH_CONFIG } from './auth0-variables'
// put your own values here
const webAuth = new auth0.WebAuth({
  domain: AUTH_CONFIG.domain, // your api domain
  clientID: AUTH_CONFIG.clientID, // clientId (not Auth0 Management API id)
  redirectUri: AUTH_CONFIG.redirectUri, // 'http://localhost:8000/callback',
  audience: AUTH_CONFIG.audience, // 'https://'+ domain + '/api/v2/' (domain same as above)
  responseType: AUTH_CONFIG.responseType,
  scope: AUTH_CONFIG.scope
})

const AUTHENTICATE = gql`
    mutation authenticate($idToken: String!) {
        authenticate(idToken: $idToken) {
            id
            name
            email
        }
    }
`

const auth = new Vue({
  computed: {
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
  methods: {
    login() {
      webAuth.authorize()
    },
    logout() {
      return new Promise((resolve, reject) => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('id_token')
        localStorage.removeItem('expires_at')
        localStorage.removeItem('user')
        window.location.assign("/")
        resolve('You where logged out')
        //webAuth.authorize()
      })
    },
    isAuthenticated() {
      return new Date().getTime() < this.expiresAt
    },
    handleAuthentication() {
      return new Promise((resolve, reject) => {
        webAuth.parseHash((err, authResult) => {
          if (authResult && authResult.accessToken && authResult.idToken) {
            // set authResult values in localStorage
            this.expiresAt = authResult.expiresIn
            this.accessToken = authResult.accessToken
            this.token = authResult.idToken
            this.user = authResult.idTokenPayload
            //synchronize user info to prisma db
            this.signinOrCreateAccount(authResult)
            // Pass authResult values too caller (callback)
            resolve(authResult)
          } else if (err) {
            this.logout()
            reject(err)
          }

        })
      })
    },
    signinOrCreateAccount ({idToken}) {
      client
        .mutate({
          mutation: AUTHENTICATE,
          variables: { idToken }
        })
        .then(res => {
          if (window.location.href.includes(`callback`)) {
            window.location.assign("/")
          } else {
            console.log('still logged in after refresh ?')
            window.location.reload()
          }
        }).catch(err => console.log('Sign in or create account error: ', err))
      }
  }
})

export default {
  install: function(Vue) {
    Vue.prototype.$auth = auth
  }
}
