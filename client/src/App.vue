<template>
  <div id="app">
    <nav class="pa3 pa4-ns navigation">
      <router-link v-bind:to="'/'" exact class="link dim b f6 f5-ns dib mr3" title="Feed">Blog</router-link>
      <router-link v-bind:to="'/'" exact class="link dim f6 f5-ns dib mr3 black" title="Feed">Feed</router-link>
      <router-link v-bind:to="'/drafts'" exact class="link dim f6 f5-ns dib mr3 black" title="Drafts">Drafts</router-link>

      <a href="#" v-if="!$auth.isAuthenticated" @click="$auth.login" class="link dim f6 f5-ns dib mr3 black">Login</a>
      <a href="#" v-if="$auth.isAuthenticated" @click="$auth.logout" class="link dim f6 f5-ns dib mr3 black">Logout</a>
      <router-link v-bind:to="'/create'" v-if="$auth.isAuthenticated" exact class="f6 link dim br1 ba ph3 pv2 fr mb2 dib black" title="Drafts">+ Create Draft</router-link>
    </nav>

    <div class="fl w-100 pl4 pr4">
      <!--h3>isAuthenticated: {{$auth.isAuthenticated}}</h3-->
      <router-view/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>

body, input, button {
  font-family: Helvetica, sans-serif;
  font-size: 16pt;
}

ul li {
  list-style: none;
}

.app {
  text-align: center;
  display: flex;
  justify-content: center;

  padding: 12px;
  margin: auto;
}

input:focus {
  box-shadow: none;
  outline: none;
  border-color: #40b883;
}

input {
  padding: 8px;
  border: solid 1px #bbb;
  border-radius: 2px;
}
@import 'https://fonts.googleapis.com/css?family=Open+Sans:300, 400';

body {
  margin: 0;
  padding: 0;
  font-family: 'Open Sans', sans-serif;
  background: rgba(0, 0, 0, 0.05);
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

.post {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
  width: 350px;
  height: 350px;
  flex: 0 0 350px;
}

.post .description {
  flex: 1;
  padding-left: 25px;
  font-size: 25px;
}

.detail {
  width: 600px;
  height: 600px;
  flex: 0 0 600px;
}

.detail .description {
  flex: 1;
  padding-left: 40px;
  font-size: 38px;
}

.title {
  font-size: 42px;
}

.content {
  font-size: 18px;
}

.new-post {
  background-color: rgba(0, 0, 0, 0.04);
}

.close {
  opacity: 0.5;
  margin-top: 60px;
  margin-right: 60px;
}

.close img {
  width: 20px;
  height: 20px;
}


</style>
