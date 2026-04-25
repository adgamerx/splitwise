const balanceRepository = require("../repositories/balanceRepository");
const userRepository = require("../repositories/userRepository");
const { NotFoundError } = require("../utils/errors");
const { calculateNetBalancesForUser } = require("../utils/balance");

async function getBalancesForUser(userId) {
  const normalizedUserId = Number(userId);

  const currentUser = await userRepository.findById(normalizedUserId);
  if (!currentUser) {
    throw new NotFoundError("User not found");
  }

  const rows = await balanceRepository.getDebtRowsForUser(normalizedUserId);
  const balances = calculateNetBalancesForUser(rows, normalizedUserId);
  const counterpartIds = [...new Set(balances.map((entry) => entry.withUserId))];
  const counterpartUsers = counterpartIds.length
    ? await userRepository.findAllByIds(counterpartIds)
    : [];

  const counterpartById = new Map(
    counterpartUsers.map((user) => [
      user.id,
      {
        id: user.id,
        email: user.email,
        defaultCurrency: user.defaultCurrency
      }
    ])
  );

  return {
    userId: normalizedUserId,
    balances: balances.map((entry) => ({
      ...entry,
      withUser: counterpartById.get(entry.withUserId) || null
    }))
  };
}

module.exports = {
  getBalancesForUser
};
