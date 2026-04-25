const express = require("express");
const routes = require("./routes");
const { attachRequestContext } = require("./middlewares/requestContext");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(attachRequestContext);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
