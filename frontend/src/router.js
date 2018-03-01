import Vue from "vue";
import Router from "vue-router";
import VueMaterial from "vue-material";
import VueResource from "vue-resource";

import Home from "./views/Home.vue";
import Leaderboard from "./views/Leaderboard.vue";
import PageNotFound from "./views/PageNotFound.vue";

import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/black-green-dark.css";

Vue.use(Router);
Vue.use(VueResource);
Vue.use(VueMaterial);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: Leaderboard
    },
    {
      path: "*",
      name: "404",
      component: PageNotFound
    }
  ]
});
