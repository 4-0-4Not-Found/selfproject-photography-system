const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  deliveryMethod: {
    type: DataTypes.ENUM("pickup", "delivery"),
    defaultValue: "pickup",
  },
  deliveryAddress: { type: DataTypes.STRING, allowNull: true }, // needed if delivery
  status: {
    type: DataTypes.ENUM("pending", "editing", "ready", "printed", "delivered", "picked_up", "canceled"),
    defaultValue: "pending",
  },
  paymentStatus: {
    type: DataTypes.ENUM("unpaid", "paid"),
    defaultValue: "unpaid",
  },
});

module.exports = Order;
