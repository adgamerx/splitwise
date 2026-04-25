module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define(
    "Expense",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      totalAmountMinor: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "total_amount_minor"
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false
      },
      splitType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "EQUAL",
        field: "split_type"
      },
      expenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "expense_date"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "created_by_user_id"
      },
      paidByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "paid_by_user_id"
      }
    },
    {
      tableName: "expenses",
      underscored: true,
      paranoid: true
    }
  );

  Expense.associate = (models) => {
    Expense.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdByUserId"
    });

    Expense.belongsTo(models.User, {
      as: "payer",
      foreignKey: "paidByUserId"
    });

    Expense.hasMany(models.ExpenseParticipant, {
      as: "participants",
      foreignKey: "expenseId"
    });
  };

  return Expense;
};
