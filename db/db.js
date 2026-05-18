import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
  dialect: 'postgres',
  logging: false
});

export async function initDB() {
  await import('../models/user.model.js');
  await import('../models/type.model.js');
  await import('../models/newsType.model.js');
  await import('../models/news.model.js');
  await import('../models/comment.model.js');
  await import('../models/like.model.js');
  await import('../models/share.model.js');
  await import('../models/notification.model.js');

  await sequelize.authenticate();
  console.log('Connection established successfully.');

  await sequelize.sync({ alter: true });
  console.log('Tables created/synced');
}

export default sequelize;