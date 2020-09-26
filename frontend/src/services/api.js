const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://leadoii-api.now.sh/"
    : "http://localhost:3000/";

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
  if (user.problems.length > 0) {
    for (let problem of user.problems) {
      user.score += problem.score * problem.multiplier;
    }
    user.score = Math.round(user.score);
  }
  return user;
}

export default {
  getUserWithScore,
}
