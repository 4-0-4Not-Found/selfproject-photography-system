const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  method: { type: DataTypes.ENUM("cash", "gcash"), allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "pending",
  },
});

module.exports = Payment;
