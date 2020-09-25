const olinfo = require('../libs/olinfo');

module.exports = async (request, response) => {
  const taskname = request.query.taskname;
  let data;
  try {
    data = await olinfo.task(taskname);
  } catch (error) {
    return response.status(error.status).json({error: error.message});
  }
  return response.status(200).json(data);
};
