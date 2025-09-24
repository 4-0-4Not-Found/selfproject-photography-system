const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Service = sequelize.define("Service", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = Service;
