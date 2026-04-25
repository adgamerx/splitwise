module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password_hash"
      },
      defaultCurrency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        field: "default_currency"
      }
    },
    {
      tableName: "users",
      underscored: true,
      paranoid: true
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Expense, {
      as: "createdExpenses",
      foreignKey: "createdByUserId"
    });

    User.hasMany(models.Expense, {
      as: "paidExpenses",
      foreignKey: "paidByUserId"
    });

    User.hasMany(models.ExpenseParticipant, {
      as: "expenseParticipants",
      foreignKey: "userId"
    });

    User.hasMany(models.ActivityLog, {
      as: "activityLogs",
      foreignKey: "actorUserId"
    });
  };

  return User;
};
