const { Expense, ExpenseParticipant, ActivityLog } = require("../models");

async function createExpenseWithParticipants(payload, transaction) {
  const expense = await Expense.create(payload.expense, { transaction });

  await ExpenseParticipant.bulkCreate(
    payload.participants.map((participant) => ({
      ...participant,
      expenseId: expense.id
    })),
    { transaction }
  );

  if (payload.activityLog) {
    await ActivityLog.create(
      {
        ...payload.activityLog,
        entityId: expense.id
      },
      { transaction }
    );
  }

  return findExpenseById(expense.id, transaction);
}

async function findExpenseById(expenseId, transaction) {
  return Expense.findByPk(expenseId, {
    include: [
      {
        model: ExpenseParticipant,
        as: "participants"
      }
    ],
    transaction
  });
}

module.exports = {
  createExpenseWithParticipants,
  findExpenseById
};
