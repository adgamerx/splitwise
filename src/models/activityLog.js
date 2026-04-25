module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    "ActivityLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      actorUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "actor_user_id"
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "entity_type"
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "entity_id"
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      tableName: "activity_logs",
      underscored: true,
      paranoid: false
    }
  );

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.User, {
      as: "actor",
      foreignKey: "actorUserId"
    });
  };

  return ActivityLog;
};
