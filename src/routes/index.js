const express = require("express");
const userRoutes = require("./userRoutes");
const expenseRoutes = require("./expenseRoutes");
const balanceRoutes = require("./balanceRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/expenses", expenseRoutes);
router.use("/balances", balanceRoutes);

module.exports = router;
