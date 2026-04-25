const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

function parseValueToMinorUnits(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Amount must be a finite number");
    }

    value = value.toFixed(2);
  }

  if (typeof value !== "string") {
    throw new Error("Amount must be a string or number");
  }

  const trimmed = value.trim();
  if (!MONEY_PATTERN.test(trimmed)) {
    throw new Error("Amount must be a positive number with up to 2 decimal places");
  }

  const [wholePart, decimalPart = ""] = trimmed.split(".");
  const minor = Number(wholePart) * 100 + Number((decimalPart + "00").slice(0, 2));

  if (!Number.isSafeInteger(minor) || minor <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return minor;
}

function splitAmountEqually(totalAmountMinor, memberIds) {
  if (!Number.isInteger(totalAmountMinor) || totalAmountMinor <= 0) {
    throw new Error("Total amount must be a positive integer in minor units");
  }

  const normalizedMembers = [...new Set(memberIds.map((id) => Number(id)))].sort((a, b) => a - b);

  if (normalizedMembers.length === 0) {
    throw new Error("At least one member is required");
  }

  const splitCount = normalizedMembers.length;
  const baseShare = Math.floor(totalAmountMinor / splitCount);
  let remainder = totalAmountMinor % splitCount;

  return normalizedMembers.map((userId) => {
    const shareAmountMinor = baseShare + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {
      remainder -= 1;
    }

    return {
      userId,
      shareAmountMinor
    };
  });
}

module.exports = {
  parseValueToMinorUnits,
  splitAmountEqually
};
