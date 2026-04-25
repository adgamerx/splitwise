const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middlewares/validate");
const { createUserSchema } = require("../validators/userValidators");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/", validate(createUserSchema), asyncHandler(userController.createUser));

module.exports = router;
