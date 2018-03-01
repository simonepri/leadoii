const fastify = require('fastify')({logger: true});
const cors = require('cors');
const errors = require('http-errors');
const got = require('got');
const LRU = require('lru');

const port = process.env.npm_package_config_port;
const api = process.env.npm_package_config_api;
const client = process.env.npm_package_config_client;

const userCache = new LRU({max: 1000, maxAge: 5 * 60 * 1000});
const multCache = new LRU({max: 10000, maxAge: 24 * 60 * 1000});

let corsOption;
if (process.env.production) {
  corsOption = {
    origin: client
  };
}
fastify.use(cors(corsOption));

async function getUser(username) {
  if (userCache.peek(username) !== undefined) {
    return userCache.get(username);
  }
  const response = await got.post(`${api}/user`, {
    body: {action: 'get', username},
    json: true
  });
  if (!response.body) {
    throw new errors.InternalServerError('Empty body');
  }
  if (response.body.error === 'Not found') {
    throw new errors.NotFound('User not found');
  }
  userCache.set(username, response.body);
  return response.body;
}

async function getProblemMutiplier(probname) {
  if (multCache.peek(probname) !== undefined) {
    return multCache.get(probname);
  }
  const response = await got.post(`${api}/task`, {
    body: {action: 'get', name: probname},
    json: true
  });
  if (!response.body) {
    throw new errors.InternalServerError('Empty body');
  }
  if (response.body.error === 'Not found') {
    throw new errors.NotFound('User not found');
  }
  multCache.set(probname, response.body.score_multiplier);
  return response.body.score_multiplier;
}

fastify.get('/user/:username', async (request, reply) => {
  let data;
  try {
    data = await getUser(request.params.username);
  } catch (err) {
    request.log.error(err);
    throw new errors.InternalServerError();
  }

  const promises = [];
  data.scores.map(async problem => {
    const promise = getProblemMutiplier(problem.name);
    promises.push(promise);
    problem.multiplier = await promise;
    return problem;
  });
  try {
    await Promise.all(promises);
  } catch (err) {
    request.log.error(err);
    throw new errors.InternalServerError();
  }

  reply.type('application/json').code(200);
  return {
    name: `${data.first_name} ${data.last_name}`,
    username: data.username,
    mailhash: data.mail_hash,
    score: data.score,
    problems: data.scores
  };
});

fastify.listen(port, err => {
  if (err) {
    throw err;
  }
});
