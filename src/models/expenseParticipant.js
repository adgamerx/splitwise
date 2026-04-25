module.exports = (sequelize, DataTypes) => {
  const ExpenseParticipant = sequelize.define(
    "ExpenseParticipant",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      expenseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "expense_id"
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id"
      },
      shareAmountMinor: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "share_amount_minor"
      }
    },
    {
      tableName: "expense_participants",
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["expense_id", "user_id"]
        }
      ]
    }
  );

  ExpenseParticipant.associate = (models) => {
    ExpenseParticipant.belongsTo(models.Expense, {
      as: "expense",
      foreignKey: "expenseId"
    });

    ExpenseParticipant.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId"
    });
  };

  return ExpenseParticipant;
};
