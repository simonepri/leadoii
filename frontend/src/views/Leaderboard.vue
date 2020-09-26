<template>
  <md-content class="leaderboard">
    <md-table class="md-elevation-10" v-model="searched" v-if="!refresh" :md-sort.sync="currentSort" :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-card>
      <md-table-toolbar>
        <div class="md-toolbar-section-start">
          <h1 class="md-title">🏆 Leaderboard</h1>
          <router-link v-bind:to="edit">
            <md-button class="md-icon-button md-primary" style="display: inline">
              <md-icon>settings</md-icon>
            </md-button>
          </router-link>
          <md-button class="md-icon-button md-primary" style="display: inline" v-on:click="load(true)" :disabled="loading">
            <md-icon v-if="!loading">refresh</md-icon>
            <md-progress-spinner class="md-accent" md-mode="indeterminate" :md-diameter="18" :md-stroke="2" v-if="loading"></md-progress-spinner>
          </md-button>
        </div>

        <md-field md-clearable class="md-toolbar-section-end">
          <md-input placeholder="Filter by problem name..." v-model="search" @input="onSearch" />
        </md-field>
      </md-table-toolbar>

      <md-table-empty-state
        md-label="No matching user found"
        :md-description="search.length > 0 ? `No user has attempted a problem whose name contains: '${search}'. Try a different search term.`:``"
        v-if="search.length > 0 && !searched.length">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Avatar">
          <a :href="'https://training.olinfo.it/#/user/' + item.username" target="_blank">
            <img class="img-circle user-thumbnail" :src="'https://gravatar.com/avatar/' + item.mailhash + '?d=identicon&s=40'">
          </a>
        </md-table-cell>
        <md-table-cell md-label="Username" md-sort-by="username"><b>{{ item.username }}</b></md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="Score" md-sort-by="score" ><b>{{ item.score }}</b></md-table-cell>
        <md-table-cell md-label="Problems" md-sort-by="problems.length">
          <md-button class="md-primary md-raised" @click="dialog = true; problems=item.problems">Show Problems ({{ item.problems.length }})</md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <md-dialog :md-active.sync="dialog">
      <md-dialog-title>Problems attempted</md-dialog-title>

      <md-content class="problems" md-dynamic-height>
        <span class="problem" v-for="(problem, index) in problems" :key="index">
          <ProblemChip :name="problem.name" :score="problem.score" :title="problem.title"/>
        </span>
      </md-content>

      <md-dialog-actions>
        <md-button class="md-primary md-raised" @click="dialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
  </md-content>
</template>

<script>
import ProblemChip from "../components/ProblemChip.vue";
import Api from "../services/api.js";
import Utils from "../services/utils.js";

export default {
  name: "Leaderboard",
  components: {
    ProblemChip
  },
  data: () => ({
    usernames: [],
    problems: [],
    search: '',
    searched: [],
    users: [],
    problems: [],
    dialog: false,
    edit: {},
    loading: false,
    refresh: false,
    currentSort: 'score',
    currentSortOrder: 'desc',
  }),
  methods: {
    async triggerTableUpdate() {
      const self = this;

      self.refresh = true;
      await self.$nextTick();
      self.refresh = false;
    },
    load(refresh = false) {
      const self = this;

      if (self.loading) {
        return;
      }

      self.loading = true;
      self.users = [];
      if (!refresh) {
        self.searched = self.users;
      }
      self.triggerTableUpdate();
      const promises = [];
      self.usernames.forEach(name => {
        const promise = Api.getUserWithScore(self.$http, name, self.problems).then(user => {
          self.users.push(user);
          if (!refresh) {
            self.customSort(self.users);
          }
        }).catch(error => {
          console.error(error);
        });
        promises.push(promise);
      });

      return Promise.all(promises).finally(async () => {
        self.customSort(self.users);
        self.searched = self.users;
        self.loading = false;
        self.triggerTableUpdate();
      });
    },
    onSearch() {
      const self = this;

      if (self.search.length > 0) {
        self.searched = self.users.filter(user =>
          user.problems.some(problem => problem.name.match(self.search))
        );
      } else {
        self.searched = self.users;
      }
    },
    customSort (value) {
      const sortBy = this.currentSort
      const isDesc = this.currentSortOrder === 'desc'
      return value.sort(Utils.universalObjectComparator(sortBy, isDesc))
    }
  },
  created: function() {
    const self = this;

    self.usernames = Utils.parseQueryArray(self.$route.query.u);
    self.problems = Utils.parseQueryArray(self.$route.query.p);
    self.edit = {name: 'home', query: {u: self.usernames, p: self.problems}};

    if (self.usernames.length === 0) {
      self.$router.push(self.edit);
    }

    setInterval(self.load, 2.5 * 60 * 1000);
    return self.load();
  }
};
</script>

<style lang="scss" scoped>
.leaderboard {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: #212121 !important;
}
.md-card,
.md-content {
  height: 100%;
}
.md-table-cell a {
  color: #ffffff;
}
.md-table-cell a:hover {
  color: #ffffff;
}
.problems {
  text-align: center;
  overflow: auto;
}
.problems .problem {
  padding: 5px;
}
.md-field.md-toolbar-section-end {
  max-width: 500px;
}
.md-dialog-title.md-title {
  text-align: center;
}
.md-toolbar-section-start .md-title {
  line-height: 3;
  max-width: 150px;
}
</style>
