const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Photo = sequelize.define("Photo", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  original_url: { type: DataTypes.STRING, allowNull: false },
  edited_url: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Photo;
