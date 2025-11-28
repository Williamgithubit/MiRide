export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('messages', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    car_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'cars',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    message_text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  // Add indexes
  await queryInterface.addIndex('messages', ['owner_id', 'is_read']);
  await queryInterface.addIndex('messages', ['sender_id']);
  await queryInterface.addIndex('messages', ['car_id']);
  await queryInterface.addIndex('messages', ['created_at']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('messages');
};
