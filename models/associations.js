import User from './user.model.js';
import Comment from './comment.model.js';
import News from './news.model.js';
import Like from './like.model.js';
import Share from './share.model.js';
// import any other models...

// User associations
User.hasMany(Comment, { foreignKey: 'user_id' });
User.hasMany(News, { foreignKey: 'user_id' });
User.hasMany(Like, { foreignKey: 'user_id' });
User.hasMany(Share, { foreignKey: 'user_id' });
User.hasMany(News, { foreignKey: 'user_id', as: 'author' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(News, { foreignKey: 'news_id' });

// News associations
News.hasMany(Comment, { foreignKey: 'news_id' });
News.hasMany(Like, { foreignKey: 'news_id' });
News.hasMany(Share, { foreignKey: 'news_id' });
News.belongsTo(User, { foreignKey: 'user_id' });
News.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Like associations
Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(News, { foreignKey: 'news_id' });

// Share associations
Share.belongsTo(User, { foreignKey: 'user_id' });
Share.belongsTo(News, { foreignKey: 'news_id' });

export { User, Comment, News, Like, Share };