import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const User = sequelize.define('User', {
  
user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
password: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
user_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Types',
      key: 'user_type_id'
    }
  }
}, {
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['username']
    },
    {
      fields: ['user_type_id']
    }
  ]
});

export default User;