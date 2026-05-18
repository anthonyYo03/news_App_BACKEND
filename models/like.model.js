import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Like = sequelize.define('Like', {
  
  like_id: {
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
  tableName: 'likes',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['news_id']
    },
    {
      fields: ['user_id', 'news_id'],
      unique: true
    },
    
  ]
});

export default Like;
