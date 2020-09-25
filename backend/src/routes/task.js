const olinfo = require('../libs/olinfo');

module.exports = async (req, res) => {
  const taskname = req.query.taskname;
  let data;
  try {
    data = await olinfo.task(taskname);
  } catch (error) {
    return res.status(error.status).json({error: error.message});
  }
  return res.status(200).json(data);
}
