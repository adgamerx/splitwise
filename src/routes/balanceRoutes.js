const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireUserContext } = require("../middlewares/requestContext");
const balanceController = require("../controllers/balanceController");

const router = express.Router();

router.get("/", requireUserContext, asyncHandler(balanceController.getBalances));

module.exports = router;
