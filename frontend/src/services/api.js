const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://leadoii-api.now.sh/"
    : "http://localhost:3000/";

async function getTask(http, taskname) {
  const response = await http.get(`${API_BASE_URL}task/${taskname}`);
  return response.body;
}

async function getUser(http, username) {
  const response = await http.get(`${API_BASE_URL}user/${username}`);
  return response.body;
}

async function getUserWithScore(http, username, problems) {
  const user = await getUser(http, username);
  if (problems.length > 0) {
    user.problems = user.problems.filter(problem => problems.includes(problem.name));
  }
  user.score = 0;
  if (user.problems.length == 0) {
    return user;
  }
  const promises = [];
  for (let problem of user.problems) {
    const promise = getTask(http, problem.name)
      .then(task => problem.score * task.score_multiplier);
    promises.push(promise);
  }
  const results = await Promise.allSettled(promises);
  for (let result of results) {
    if (result.status == "rejected") {
      if (result.reason.status === 404) {
        continue;
      }
      throw result.reason;
    }
    user.score += result.value;
  }
  user.score = Math.round(user.score);
  return user;
}

export default {
  getUserWithScore,
}
