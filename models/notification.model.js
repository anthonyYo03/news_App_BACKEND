import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Notification = sequelize.define('Notification', {
  
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  notification_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'like, comment, share,new_news'
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
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
    allowNull: true,
    references: {
      model: 'News',
      key: 'news_id'
    }
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  

}, {
  tableName: 'notifications',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['news_id']
    },
    {
      fields: ['is_read']
    },
   
    {
      fields: ['user_id', 'is_read']
    },
    
  ]
});

export default Notification;
