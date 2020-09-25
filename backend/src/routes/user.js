const got = require('got');
const olinfo = require('../libs/olinfo');

function getAPIHostAndPort(req) {
  let proto = req.connection.encrypted ? 'https' : 'http';
  proto = req.headers['x-forwarded-proto'] || proto;
  proto = proto.split(/\s*,\s*/)[0];
  return `${proto}://${req.headers.host}`;
}

module.exports = async (req, res) => {
  const username = req.query.username;
  let data;
  try {
    data = await olinfo.user(username);
  } catch (error) {
    return res.status(error.status).json({error: error.message});
  }

  const promises = [];
  data.scores.forEach(problem => {
    problem.multiplier = 0;
    const promise = got.get(`task/${problem.name}`, {
      baseUrl: getAPIHostAndPort(req),
      json: true
    }).then(response => {
      problem.multiplier = response.body.score_multiplier;
    }).catch(error => {
      console.error(error);
    });
    promises.push(promise);
  });
  await Promise.all(promises);

  res.status(200).json({
    name: `${data.first_name} ${data.last_name}`,
    username: data.username,
    mailhash: data.mail_hash,
    score: data.score,
    problems: data.scores
  });
}
