const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");
const Order = require("./order");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  method: { type: DataTypes.ENUM("cash", "gcash"), allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "pending",
  },
});

// Associations
Order.hasOne(Payment, { foreignKey: "orderId", onDelete: "CASCADE" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

module.exports = Payment;
