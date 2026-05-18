import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const NewsType = sequelize.define('NewsType', {
  
  news_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'local, politics, sports, entertainment, international, economy'
  }

}, {
  tableName: 'news_types',
  indexes: [
    {
      unique: true,
      fields: ['type']
    }
  ]
});

export default NewsType;