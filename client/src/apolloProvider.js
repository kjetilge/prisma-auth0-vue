import Vue from 'vue'

import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import VueApollo from 'vue-apollo'

// modules used for authenticating to the prisma API
import { setContext } from 'apollo-link-context'
import { ApolloLink } from 'apollo-link'

const url = 'localhost:4000' // or eu1.prisma.sh/username/service-name
const httpLink = new HttpLink({ uri: `http://${url}` }) //add extra s when using https

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('access_token')
  console.log('access_token from localStorage', token)
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ``
    }
  }
})

// ######### localhost does not use https/wss !! ############
const wsLink = new WebSocketLink({
  uri: `ws://${url}`, // add extra s when using wss
  options: {
    reconnect: true
  }
})

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true
})

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: client,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})

const provide = () => {return apolloProvider.provide()}

export {
  client,
  provide
}
