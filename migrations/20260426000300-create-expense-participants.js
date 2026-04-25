"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expense_participants", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      expense_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "expenses",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      share_amount_minor: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addConstraint("expense_participants", {
      fields: ["expense_id", "user_id"],
      type: "unique",
      name: "expense_participants_expense_id_user_id_unique"
    });

    await queryInterface.addIndex("expense_participants", ["user_id"], {
      name: "expense_participants_user_id_idx"
    });

    await queryInterface.addIndex("expense_participants", ["expense_id"], {
      name: "expense_participants_expense_id_idx"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("expense_participants");
  }
};
