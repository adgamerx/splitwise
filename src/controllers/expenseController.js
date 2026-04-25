const expenseService = require("../services/expenseService");

async function createExpense(req, res) {
  const expense = await expenseService.createExpense(req.body, req.context.userId);

  return res.status(201).json({
    data: expense
  });
}

module.exports = {
  createExpense
};
