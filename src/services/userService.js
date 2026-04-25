const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const { ConflictError } = require("../utils/errors");

const PASSWORD_ROUNDS = 10;

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    defaultCurrency: user.defaultCurrency,
    createdAt: user.createdAt
  };
}

async function createUser(payload) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedCurrency = payload.defaultCurrency.trim().toUpperCase();

  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, PASSWORD_ROUNDS);

  const user = await userRepository.createUser({
    email: normalizedEmail,
    passwordHash,
    defaultCurrency: normalizedCurrency
  });

  return toPublicUser(user);
}

module.exports = {
  createUser
};
