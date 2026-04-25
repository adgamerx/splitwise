const fs = require("fs");
const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const db = {};

const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== path.basename(__filename) && file.endsWith(".js"));

for (const file of modelFiles) {
  const defineModel = require(path.join(__dirname, file));
  const model = defineModel(sequelize, DataTypes);
  db[model.name] = model;
}

for (const modelName of Object.keys(db)) {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = require("sequelize");

module.exports = db;
