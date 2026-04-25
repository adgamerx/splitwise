const balanceService = require("../services/balanceService");

async function getBalances(req, res) {
  const balances = await balanceService.getBalancesForUser(req.context.userId);

  return res.status(200).json({
    data: balances
  });
}

module.exports = {
  getBalances
};
