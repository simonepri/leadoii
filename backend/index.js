const fastify = require('fastify')({logger: true});
const cors = require('cors');
const errors = require('http-errors');
const got = require('got');
const QuickLRU = require('quick-lru');

const port = process.env.npm_package_config_port;
const api = process.env.npm_package_config_api;

const lru = new QuickLRU({maxSize: 1000});

fastify.use(cors());

fastify.get('/user/:username', async (request, reply) => {
  let data;
  if (lru.has(request.params.username)) {
    data = lru.get(request.params.username);
  } else {
    try {
      const response = await got.post(`${api}/user`, {
        body: {action: 'get', username: request.params.username},
        json: true
      });
      if (!response.body) {
        throw new errors.InternalServerError('Empty body');
      }
      data = response.body;
      lru.set(request.params.username, data);
    } catch (err) {
      request.log.error(err);
      throw new errors.InternalServerError();
    }
    if (data.error === 'Not found') {
      throw new errors.NotFound('User not found');
    }
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
