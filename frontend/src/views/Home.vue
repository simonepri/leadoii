<template>
  <div class="home">
    <div class="logo">
      <img class="img" src="../assets/logo.png">
      <div class="text md-display-3">leadOII</div>
    </div>

    <form novalidate class="md-layout">
      <md-card class="md-layout-item md-elevation-5">
        <md-card-header>
          <div class="md-title">Leaderboard Generator</div>
        </md-card-header>

        <md-card-content>
          <md-chips name="usernames" id="usernames"
            v-model="form.usernames"
            md-placeholder="Insert an username..."
            md-check-duplicated
            :md-format="noSpaces" md-autocomplete="false">
            <label>Usernames</label>
          </md-chips>

          <md-chips name="problems" id="problems"
            v-model="form.problems"
            md-placeholder="Insert a problem's name..."
            md-check-duplicated
            :md-format="noSpaces">
            <label>Problems</label>
          </md-chips>
        </md-card-content>

        <md-card-actions>
          <md-button type="button" class="md-primary md-raised" @click="validateForm">Show Leaderboard</md-button>
        </md-card-actions>
      </md-card>
    </form>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    form: {
      usernames: [],
      problems: []
    }
  }),
  methods: {
    noSpaces(str) {
      return str.split(" ")[0];
    },
    validateForm() {
      console.log({ u: this.form.usernames, p: this.form.problems });
      this.$router.push({
        path: "leaderboard",
        query: { u: this.form.usernames, p: this.form.problems }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.home {
  text-align: center;
}
.logo .img {
  padding: 25px;
}
.logo .text {
  margin-bottom: 25px;
}
.md-card {
  max-width: 500px;
  margin: 0 auto;
}
.md-content {
  margin: 0 auto;
}
</style>
