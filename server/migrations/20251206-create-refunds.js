export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("refunds", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    payment_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "payments", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    rental_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "rentals", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    customer_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    stripe_refund_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: true,
      defaultValue: "usd",
    },
    reason: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("refunds");
}
