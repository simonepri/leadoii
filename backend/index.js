const fastify = require('fastify')({logger: true});
const cors = require('cors');
const errors = require('http-errors');
const got = require('got');
const LRU = require('lru');

const port = process.env.npm_package_config_port;
const api = process.env.npm_package_config_api;
const client = process.env.npm_package_config_client;

const cache = new LRU({max: 1000, maxAge: 5 * 60 * 1000});

let corsOption;
if (process.env.production) {
  corsOption = {
    origin: client
  };
}
fastify.use(cors(corsOption));

fastify.get('/user/:username', async (request, reply) => {
  let data;
  if (cache.peek(request.params.username) === undefined) {
    request.log.info({username: request.params.username, cache: false});
    try {
      const response = await got.post(`${api}/user`, {
        body: {action: 'get', username: request.params.username},
        json: true
      });
      if (!response.body) {
        throw new errors.InternalServerError('Empty body');
      }
      data = response.body;
      cache.set(request.params.username, data);
    } catch (err) {
      request.log.error(err);
      throw new errors.InternalServerError();
    }
    if (data.error === 'Not found') {
      throw new errors.NotFound('User not found');
    }
  } else {
    request.log.info({username: request.params.username, cache: true});
    data = cache.get(request.params.username);
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
