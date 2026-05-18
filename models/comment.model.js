import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Comment = sequelize.define('Comment', {
  
  comment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'comments',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['news_id']
    },

    {
      fields: ['news_id']
    }
  ]
});

export default Comment;
