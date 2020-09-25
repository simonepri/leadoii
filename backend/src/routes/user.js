const got = require('got');
const olinfo = require('../libs/olinfo');

function getAPIHostAndPort(request) {
  let proto = request.connection.encrypted ? 'https' : 'http';
  proto = request.headers['x-forwarded-proto'] || proto;
  proto = proto.split(/\s*,\s*/)[0];
  return `${proto}://${request.headers.host}`;
}

module.exports = async (request, response) => {
  const username = request.query.username;
  let data;
  try {
    data = await olinfo.user(username);
  } catch (error) {
    return response.status(error.status).json({error: error.message});
  }

  const promises = [];
  data.scores.forEach(problem => {
    problem.multiplier = 0;
    const promise = got.get(`task/${problem.name}`, {
      baseUrl: getAPIHostAndPort(request),
      json: true
    }).then(result => {
      problem.multiplier = result.body.score_multiplier;
    }).catch(error => {
      console.error(error);
    });
    promises.push(promise);
  });
  await Promise.all(promises);

  response.status(200).json({
    name: `${data.first_name} ${data.last_name}`,
    username: data.username,
    mailhash: data.mail_hash,
    score: data.score,
    problems: data.scores
  });
};
