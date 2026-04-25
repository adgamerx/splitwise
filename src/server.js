const app = require("./app");
const { sequelize } = require("./models");

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await sequelize.authenticate();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer
};
