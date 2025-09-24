const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "approved", "completed", "canceled"),
    defaultValue: "pending",
  },
});

module.exports = Booking;
