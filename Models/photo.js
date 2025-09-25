const { DataTypes } = require("sequelize");
const sequelize = require("../Config/database");

const Photo = sequelize.define("Photo", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  original_url: { type: DataTypes.STRING, allowNull: false },
  edited_url: { type: DataTypes.STRING, allowNull: true },
  orderId: {   // foreign key
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Photo;
