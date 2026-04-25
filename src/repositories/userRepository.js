const { Op } = require("sequelize");
const { User } = require("../models");

async function createUser(data, options = {}) {
  return User.create(data, options);
}

async function findByEmail(email) {
  return User.findOne({
    where: {
      email
    }
  });
}

async function findById(id) {
  return User.findByPk(id);
}

async function findAllByIds(userIds) {
  return User.findAll({
    where: {
      id: {
        [Op.in]: userIds
      }
    }
  });
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAllByIds
};
