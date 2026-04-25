const userService = require("../services/userService");

async function createUser(req, res) {
  const user = await userService.createUser(req.body);

  return res.status(201).json({
    data: user
  });
}

module.exports = {
  createUser
};
