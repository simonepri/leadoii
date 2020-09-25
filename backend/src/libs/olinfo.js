const errors = require('http-errors');
const got = require('got');

const API = 'https://training.olinfo.it/api';

async function getUser(username) {
  const response = await got.post('/user', {
    baseUrl: API,
    body: {action: 'get', username},
    json: true
  });
  if (response.body.error === 'Not found') {
    throw new errors.NotFound(`User '${username}' not found`);
  }
  if (response.body.error !== undefined) {
    throw new errors.InternalServerError(response.body.error);
  }
  return response.body;
}

async function getTask(taskname) {
  const response = await got.post('/task', {
    baseUrl: API,
    body: {action: 'get', name: taskname},
    json: true
  });
  if (response.body.error === 'Not found') {
    throw new errors.NotFound(`Task '${taskname}' not found`);
  }
  if (response.body.error !== undefined) {
    throw new errors.InternalServerError(response.body.error);
  }
  return response.body;
}

module.exports = {
  user: getUser,
  task: getTask
};
