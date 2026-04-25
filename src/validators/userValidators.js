const { z } = require("zod");

const createUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  defaultCurrency: z.string().trim().regex(/^[A-Za-z]{3}$/, "Currency must be a 3-letter ISO code")
});

module.exports = {
  createUserSchema
};
