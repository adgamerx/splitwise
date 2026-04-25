const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middlewares/validate");
const { requireUserContext } = require("../middlewares/requestContext");
const { createExpenseSchema } = require("../validators/expenseValidators");
const expenseController = require("../controllers/expenseController");

const router = express.Router();

router.post(
  "/",
  requireUserContext,
  validate(createExpenseSchema),
  asyncHandler(expenseController.createExpense)
);

module.exports = router;
