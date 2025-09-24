const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Gallery = sequelize.define("Gallery", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  image_url: { type: DataTypes.STRING, allowNull: false },
  caption: { type: DataTypes.STRING },
});

module.exports = Gallery;
