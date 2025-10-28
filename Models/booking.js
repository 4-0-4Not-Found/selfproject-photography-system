const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  customDescription: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "approved", "completed", "canceled"),
    defaultValue: "pending",
  },
  // PROFESSIONAL SOFT DELETE FIELDS
  deletedByUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userDeletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Booking;