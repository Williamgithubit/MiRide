const MessageModel = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cars',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'car_id',
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'owner_id',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'sender_id',
    },
    messageText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message_text',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
  }, {
    timestamps: true,
    tableName: 'messages',
    underscored: true,
    indexes: [
      {
        fields: ['owner_id', 'is_read']
      },
      {
        fields: ['sender_id']
      },
      {
        fields: ['car_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
    
    Message.belongsTo(models.Car, {
      foreignKey: 'carId',
      as: 'car'
    });
  };

  return Message;
};

export default MessageModel;
