import Like from '../models/like.model.js';
import User from '../models/user.model.js';
import { Op } from 'sequelize';
import sequelize from '../db/db.js';
import { sendNotification, allUsers, justJournalists } from '../service/notification.service.js';
import News from '../models/news.model.js';

const getLikes = async (req, res) => {
  const { newsId } = req.params;

  try {
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    const likesCount = await Like.count({
      where: { news_id: newsId }
    });

    const likesList = await Like.findAll({
      where: { news_id: newsId },
      attributes: ['like_id', 'user_id', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // ✅ Check if the currently authenticated user has liked this post
    const userLike = await Like.findOne({
      where: {
        news_id: newsId,
        user_id: req.userId  // comes from verifyToken middleware
      }
    });

    res.status(200).json({
      message: 'Likes retrieved successfully',
      newsId: newsId,
      totalLikes: likesCount,
      likes: likesList,
      userHasLiked: !!userLike  // ✅ add this field
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching likes: ${error.message}` 
    });
  }
};

const addLike = async (req, res) => {
  const { newsId } = req.params;

  try {
    // Validate that newsId is provided
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // Check if user has already liked the post
    const existingLike = await Like.findOne({
      where: {
        user_id: req.userId,
        news_id: newsId
      }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    // Create a new like
    const newLike = await Like.create({
      user_id: req.userId,
      news_id: newsId
    });

    // Get updated like count
    const likesCount = await Like.count({
      where: { news_id: newsId }
    });

////////////////////////
// Get the news to find its owner
const news = await News.findByPk(newsId);
const liker = await User.findByPk(req.userId);
await sendNotification({
  recipients: [news.user_id], // only the journalist who owns the post
  type: "like",
  title: "New Like",
  message: `${liker.username} liked your post`,
  relatedId: newsId,
  relatedModel: "News"
});
//////////////////////


    res.status(201).json({
      message: 'Like added successfully',
      like: newLike,
      totalLikes: likesCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while adding like: ${error.message}` 
    });
  }
};

const removeLike = async (req, res) => {
  const { newsId } = req.params;

  try {
    // Validate that newsId is provided
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // Find the like record
    const like = await Like.findOne({
      where: {
        user_id: req.userId,
        news_id: newsId
      }
    });

    if (!like) {
      return res.status(404).json({ message: 'You have not liked this post' });
    }

    // Delete the like
    await Like.destroy({
      where: {
        user_id: req.userId,
        news_id: newsId
      }
    });

    // Get updated like count
    const likesCount = await Like.count({
      where: { news_id: newsId }
    });

    res.status(200).json({
      message: 'Like removed successfully',
      totalLikes: likesCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while removing like: ${error.message}` 
    });
  }
};

export const likeControllers = {
  getLikes,
  addLike,
  removeLike
};
