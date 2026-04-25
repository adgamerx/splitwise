const { sequelize } = require("../models");
const expenseRepository = require("../repositories/expenseRepository");
const userRepository = require("../repositories/userRepository");
const { ValidationError } = require("../utils/errors");
const { parseValueToMinorUnits, splitAmountEqually } = require("../utils/money");

function mapExpense(expense) {
  return {
    id: expense.id,
    name: expense.name,
    totalAmountMinor: Number(expense.totalAmountMinor),
    currency: expense.currency,
    splitType: expense.splitType,
    expenseDate: expense.expenseDate,
    paidByUserId: expense.paidByUserId,
    createdByUserId: expense.createdByUserId,
    notes: expense.notes,
    members: expense.participants
      .map((participant) => ({
        userId: participant.userId,
        shareAmountMinor: Number(participant.shareAmountMinor)
      }))
      .sort((a, b) => a.userId - b.userId),
    createdAt: expense.createdAt
  };
}

function normalizeMemberIds(members) {
  const uniqueMembers = [...new Set(members.map((memberId) => Number(memberId)))];

  if (uniqueMembers.some((memberId) => !Number.isInteger(memberId) || memberId <= 0)) {
    throw new ValidationError("Members must contain valid positive integer user ids");
  }

  return uniqueMembers;
}

async function createExpense(payload, contextUserId) {
  const creatorUserId = Number(contextUserId);
  const paidByUserId = Number(payload.paidByUserId);
  const memberIds = normalizeMemberIds(payload.members);

  if (!memberIds.includes(paidByUserId)) {
    throw new ValidationError("paidByUserId must be present in members array");
  }

  if (!memberIds.includes(creatorUserId)) {
    throw new ValidationError("Creator user must be present in members array");
  }

  let totalAmountMinor;
  try {
    totalAmountMinor = parseValueToMinorUnits(payload.value);
  } catch (error) {
    throw new ValidationError(error.message);
  }

  const splitShares = splitAmountEqually(totalAmountMinor, memberIds);
  const allocatedTotal = splitShares.reduce((sum, share) => sum + share.shareAmountMinor, 0);
  if (allocatedTotal !== totalAmountMinor) {
    throw new ValidationError("Unable to allocate split amount deterministically");
  }

  const involvedUserIds = [...new Set([...memberIds, paidByUserId, creatorUserId])];
  const users = await userRepository.findAllByIds(involvedUserIds);
  if (users.length !== involvedUserIds.length) {
    const foundUserIds = new Set(users.map((user) => user.id));
    const missingUserIds = involvedUserIds.filter((id) => !foundUserIds.has(id));

    throw new ValidationError("Some users do not exist", {
      missingUserIds
    });
  }

  const expense = await sequelize.transaction((transaction) =>
    expenseRepository.createExpenseWithParticipants(
      {
        expense: {
          name: payload.name.trim(),
          totalAmountMinor,
          currency: payload.currency.toUpperCase(),
          splitType: "EQUAL",
          expenseDate: payload.date,
          notes: payload.notes ? payload.notes.trim() : null,
          createdByUserId: creatorUserId,
          paidByUserId
        },
        participants: splitShares.map((share) => ({
          userId: share.userId,
          shareAmountMinor: share.shareAmountMinor
        })),
        activityLog: {
          actorUserId: creatorUserId,
          entityType: "expense",
          action: "created",
          metadata: {
            splitType: "EQUAL",
            memberCount: memberIds.length,
            currency: payload.currency.toUpperCase()
          }
        }
      },
      transaction
    )
  );

  return mapExpense(expense);
}

module.exports = {
  createExpense
};
