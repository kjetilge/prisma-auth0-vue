<template>
  <div class="callback">
    <vue-simple-spinner size="large" message="Authenticating..."></vue-simple-spinner>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import VueSimpleSpinner from 'vue-simple-spinner'

const AUTHENTICATE = gql`
    mutation authenticate($idToken: String!) {
        authenticate(idToken: $idToken) {
            id
            name
            email
        }
    }
`

export default {
  name: 'callback',
  mounted() {
    this.$auth.handleAuthentication().then((data) => {
      console.log('handleAuthentication callback data', data)
    })
  },
  components: {
    VueSimpleSpinner
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .callback {
    height: calc(100vh - 180px);
    display: grid;
    align-items: center;
  }
</style>
