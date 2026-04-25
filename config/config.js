const path = require("path");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: path.resolve(__dirname, "..", "data", "development.sqlite"),
    logging: false
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false
  },
  production: {
    dialect: "sqlite",
    storage: path.resolve(__dirname, "..", "data", "production.sqlite"),
    logging: false
  }
};
