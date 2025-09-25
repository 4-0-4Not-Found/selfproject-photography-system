const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Gallery = sequelize.define("Gallery", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  imageUrl: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Gallery;
