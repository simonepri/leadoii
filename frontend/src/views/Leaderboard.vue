<template>
  <md-content class="leaderboard">
    <md-table class="md-elevation-10" v-model="searched" md-sort="score" md-sort-order="asc" md-card>
      <md-table-toolbar>
        <div class="md-toolbar-section-start">
          <h1 class="md-title">🏆 Leaderboard</h1>
        </div>

        <md-field md-clearable class="md-toolbar-section-end">
          <md-input placeholder="Filter by problem name..." v-model="search" @input="searchOnTable" />
        </md-field>
      </md-table-toolbar>

      <md-table-empty-state
        md-label="No user found"
        :md-description="search ? `No user found for this '${search}' query. Try a different search term.`:``"
        v-if="search && !searched.length">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Avatar">
          <a :href="'https://training.olinfo.it/#/user/' + item.username">
            <img class="img-circle user-thumbnail" :src="'https://gravatar.com/avatar/' + item.mailhash + '?d=identicon&s=40'">
          </a>
        </md-table-cell>
        <md-table-cell md-label="Username" md-sort-by="username">{{ item.username }}</md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="Score" md-sort-by="score" >{{ item.score }}</md-table-cell>
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
const toLower = text => {
  return text.toString().toLowerCase();
};

const searchByProblems = function(items, term) {
  if (term) {
    return items.filter(item =>
      item.problems.some(problem =>
        toLower(problem.name).includes(toLower(term))
      )
    );
  }
  return items;
};

export default {
  name: "Leaderboard",
  components: {
    ProblemChip
  },
  data: () => ({
    search: null,
    searched: [],
    users: [],
    problems: [],
    dialog: false
  }),
  methods: {
    searchOnTable() {
      this.searched = searchByProblems(this.users, this.search);
    }
  },
  created: function() {
    let usernames = [],
      problems = [];
    if (Array.isArray(this.$route.query.u)) {
      usernames = [...new Set(this.$route.query.u)];
    } else if (typeof this.$route.query.u === "string") {
      usernames = [this.$route.query.u];
    }
    if (Array.isArray(this.$route.query.p)) {
      problems = [...new Set(this.$route.query.p)];
    } else if (typeof this.$route.query.p === "string") {
      problems = [this.$route.query.p];
    }
    if (usernames.length === 0) {
      this.$router.push({ path: "home" });
    }

    let executed = 0;
    usernames.forEach(async name => {
      try {
        const base =
          process.env.NODE_ENV === "production"
            ? "https://leadoii-api.now.sh/"
            : "http://localhost:9090/";
        const response = await this.$http.get(`${base}user/${name}`);
        const user = response.body;
        let score = 0;
        if (problems.length > 0) {
          user.problems = user.problems.filter(problem => {
            if (problems.includes(problem.name)) {
              score += problem.score;
              return true;
            }
            return false;
          });
          user.score = score;
        }
        this.users.push(user);
        this.users.sort((a, b) => b.score - a.score);
        this.searched = this.users;
        executed++;
      } catch (err) {
        executed++;
      }
      if (executed === usernames.length && this.users.length === 0) {
        this.$router.push({ path: "home" });
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.leaderboard {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: #212121;
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
</style>
