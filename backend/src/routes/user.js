const olinfo = require('../libs/olinfo');

module.exports = async (request, response) => {
  const username = request.query.username;
  let data;
  try {
    data = await olinfo.user(username);
  } catch (error) {
    return response.status(error.status).json({error: error.message});
  }

  response.status(200).json({
    name: `${data.first_name} ${data.last_name}`,
    username: data.username,
    mailhash: data.mail_hash,
    score: data.score,
    problems: data.scores
  });
};
