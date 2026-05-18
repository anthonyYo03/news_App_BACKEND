import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Share = sequelize.define('Share', {
  
  share_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  news_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'News',
      key: 'news_id'
    }
  },
  

}, {
  tableName: 'shares',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['news_id']
    },
    {
      fields: ['user_id', 'news_id'],
      
    },
   
  ]
});

export default Share;
