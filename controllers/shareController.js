import Share from '../models/share.model.js';
import User from '../models/user.model.js';
import News from '../models/news.model.js';
import { Op } from 'sequelize';
import { sendNotification } from '../service/notification.service.js';

const createShare = async (req, res) => {
  const { newsId } = req.params;

  try {
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // ❌ REMOVED: duplicate share check block

    const newShare = await Share.create({
      user_id: req.userId,
      news_id: newsId
    });

    const shareWithUser = await Share.findByPk(newShare.share_id, {
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      }
    });

    const shareCount = await Share.count({
      where: { news_id: newsId }
    });

    const news = await News.findByPk(newsId);
    const sharer = await User.findByPk(req.userId);
    await sendNotification({
      recipients: [news.user_id],
      type: "share",
      title: "New Share",
      message: `${sharer.username} shared your post`,
      relatedId: newsId,
      relatedModel: "News"
    });

    res.status(201).json({
      message: 'News shared successfully',
      share: shareWithUser,
      totalShares: shareCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while sharing news: ${error.message}` 
    });
  }
};

const getShares = async (req, res) => {
  const { newsId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    // Validate required fields
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // Get all shares for the news post with pagination
    const shares = await Share.findAll({
      where: { news_id: newsId },
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count of shares for the news
    const totalCount = await Share.count({
      where: { news_id: newsId }
    });

    res.status(200).json({
      message: 'Shares retrieved successfully',
      newsId: newsId,
      totalShares: totalCount,
      shares: shares
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching shares: ${error.message}` 
    });
  }
};

const getOneShare = async (req, res) => {
  const { shareId } = req.params;

  try {
    // Validate required fields
    if (!shareId) {
      return res.status(400).json({ message: 'Share ID is required' });
    }

    // Get single share with user details
    const share = await Share.findByPk(shareId, {
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      }
    });

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    res.status(200).json({
      message: 'Share retrieved successfully',
      share: share
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching share: ${error.message}` 
    });
  }
};


const getShareCount = async (req, res) => {
  const { newsId } = req.params;

  try {
    // Validate that newsId is provided
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // Count total shares for the news post
    const shareCount = await Share.count({
      where: { news_id: newsId }
    });

    // Check if current user has shared this news
    let userHasShared = false;
    if (req.userId) {
      userHasShared = await Share.findOne({
        where: {
          user_id: req.userId,
          news_id: newsId
        }
      }) ? true : false;
    }

    res.status(200).json({
      message: 'Share count retrieved successfully',
      newsId: newsId,
      totalShares: shareCount,
      userHasShared: userHasShared
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while counting shares: ${error.message}` 
    });
  }
};



export const shareControllers = {
  createShare,
  getShares,
  getOneShare,
  getShareCount,
};
