export default (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('platform', 'notification', 'security', 'system'),
      allowNull: false,
      defaultValue: 'platform',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'settings',
    timestamps: true,
    underscored: true,
  });

  return Settings;
};
