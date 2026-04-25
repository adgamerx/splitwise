const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const baseConfig = require("../../config/config")[env];

if (baseConfig.storage && baseConfig.storage !== ":memory:") {
  fs.mkdirSync(path.dirname(baseConfig.storage), { recursive: true });
}

const sequelize = new Sequelize({
  ...baseConfig,
  logging: process.env.SQL_LOGGING === "true" ? console.log : false
});

module.exports = sequelize;
