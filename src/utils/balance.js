function calculateNetBalancesForUser(rows, currentUserId) {
  const normalizedCurrentUserId = Number(currentUserId);
  const netByCounterparty = new Map();

  for (const row of rows) {
    const creditorUserId = Number(row.creditorUserId);
    const debtorUserId = Number(row.debtorUserId);
    const amountMinor = Number(row.amountMinor);
    const currency = row.currency;

    if (amountMinor <= 0 || creditorUserId === debtorUserId) {
      continue;
    }

    let counterpartUserId = null;
    let delta = 0;

    if (creditorUserId === normalizedCurrentUserId) {
      counterpartUserId = debtorUserId;
      delta = amountMinor;
    } else if (debtorUserId === normalizedCurrentUserId) {
      counterpartUserId = creditorUserId;
      delta = -amountMinor;
    }

    if (counterpartUserId === null) {
      continue;
    }

    const key = `${counterpartUserId}|${currency}`;
    netByCounterparty.set(key, (netByCounterparty.get(key) || 0) + delta);
  }

  const balances = [];

  for (const [key, netAmountMinor] of netByCounterparty.entries()) {
    if (netAmountMinor === 0) {
      continue;
    }

    const [withUserIdStr, currency] = key.split("|");
    balances.push({
      withUserId: Number(withUserIdStr),
      currency,
      netAmountMinor,
      absoluteAmountMinor: Math.abs(netAmountMinor),
      direction: netAmountMinor > 0 ? "you_are_owed" : "you_owe"
    });
  }

  balances.sort((a, b) => {
    if (a.withUserId !== b.withUserId) {
      return a.withUserId - b.withUserId;
    }

    return a.currency.localeCompare(b.currency);
  });

  return balances;
}

module.exports = {
  calculateNetBalancesForUser
};
