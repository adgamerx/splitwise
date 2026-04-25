const { z } = require("zod");
const { parseValueToMinorUnits } = require("../utils/money");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const createExpenseSchema = z.object({
  name: z.string().trim().min(1).max(255),
  value: z
    .union([z.string(), z.number()])
    .refine((value) => {
      try {
        parseValueToMinorUnits(value);
        return true;
      } catch {
        return false;
      }
    }, "Value must be a positive amount with up to 2 decimal places"),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/, "Currency must be a 3-letter ISO code"),
  members: z.array(z.coerce.number().int().positive()).nonempty(),
  paidByUserId: z.coerce.number().int().positive(),
  date: z
    .string()
    .trim()
    .refine((value) => DATE_PATTERN.test(value), "Date must be in YYYY-MM-DD format")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Date must be valid"),
  notes: z.string().trim().max(1000).optional()
});

module.exports = {
  createExpenseSchema
};
