import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Type = sequelize.define('Type', {
  
  user_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'reader',
    comment: 'journalist, reader, admin'
  }

}, {
  indexes: [
    {
      unique: true,
      fields: ['type']
    }
  ]
});

export default Type;