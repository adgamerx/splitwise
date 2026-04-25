const { QueryTypes } = require("sequelize");
const { sequelize } = require("../models");

async function getDebtRowsForUser(userId) {
  return sequelize.query(
    `
      SELECT
        e.paid_by_user_id AS creditorUserId,
        ep.user_id AS debtorUserId,
        ep.share_amount_minor AS amountMinor,
        e.currency AS currency
      FROM expenses e
      INNER JOIN expense_participants ep
        ON ep.expense_id = e.id
        AND ep.deleted_at IS NULL
      INNER JOIN users payer
        ON payer.id = e.paid_by_user_id
        AND payer.deleted_at IS NULL
      INNER JOIN users member
        ON member.id = ep.user_id
        AND member.deleted_at IS NULL
      WHERE e.deleted_at IS NULL
        AND ep.user_id != e.paid_by_user_id
        AND (e.paid_by_user_id = :userId OR ep.user_id = :userId)
    `,
    {
      replacements: { userId },
      type: QueryTypes.SELECT
    }
  );
}

module.exports = {
  getDebtRowsForUser
};
