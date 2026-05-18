import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const News = sequelize.define('News', {
  
  news_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Image URL from Cloudinary'
  },
  is_important: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  news_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'news_types',
      key: 'news_type_id'
    }
  },
 
}, {
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['news_type_id']
    },
    {
      fields: ['is_important']
    },
    
  ]
});

export default News;
