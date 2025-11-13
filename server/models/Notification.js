const NotificationModel = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(
        'booking_request', 
        'booking_approved', 
        'booking_rejected', 
        'booking_cancelled',
        'booking_expired',
        'rental_expired',
        'payment_received', 
        'payment_successful',
        'payment_failed',
        'rental_started', 
        'rental_completed',
        'customer_review',
        'system_alert',
        'maintenance_reminder',
        'system_message'
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON, // Store additional data like rentalId, carId, etc.
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true, // Optional expiration for notifications
    },
  }, {
    timestamps: true,
    tableName: 'notifications',
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'is_read']
      },
      {
        fields: ['type']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Notification;
};

export default NotificationModel;
