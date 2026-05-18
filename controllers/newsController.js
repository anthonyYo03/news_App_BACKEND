import News from '../models/news.model.js';
import User from '../models/user.model.js';
import { Op } from 'sequelize';
import { sendNotification, allUsers } from '../service/notification.service.js';

const createNews = async (req, res) => {
  console.log("createNews called");
  const { title, description, image_url, is_important, news_type_id } = req.body;

  try {
    // Validate required fields
    if (!title || !description || !news_type_id) {
      return res.status(400).json({ 
        message: 'Title, description, and news_type_id are required' 
      });
    }

    // Validate title and description length
    if (title.trim().length < 3) {
      return res.status(400).json({ message: 'Title must be at least 3 characters long' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters long' });
    }

    // Create news
    const newNews = await News.create({
      title,
      description,
      image_url: image_url || null,
      is_important: is_important || false,
      user_id: req.userId,
      news_type_id
    });

    // Send notification to all users (journalists and readers)
    const journalist = await User.findByPk(req.userId);
    const allUserIds = await allUsers();
    await sendNotification({
      recipients: allUserIds,
      type: "news",
      title: "New News Posted",
      message: `${journalist.username} posted a new news: ${title}`,
      relatedId: newNews.news_id,
      relatedModel: "News"
    });

    res.status(201).json({
      message: 'News created successfully',
      news: newNews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while creating news: ${error.message}` 
    });
  }
};

const getNews = async (req, res) => {
  const { newsId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    if (newsId) {
      const news = await News.findByPk(newsId, {
        include: [{ model: User, as: 'author', attributes: ['username'] }]  // 👈 add this
      });
      
      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      return res.status(200).json(news);
    }

    // Otherwise, get all news with pagination
   const allNews = await News.findAll({
      include: [{ model: User, as: 'author', attributes: ['username'] }],  // 👈 add this
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset) 
    });

    // Get total count of news
    const totalCount = await News.count();

    res.status(200).json({
      message: 'News retrieved successfully',
      totalNews: totalCount,
      count: allNews.length,
      news: allNews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching news: ${error.message}` 
    });
  }
};

const updateNews = async (req, res) => {
  const { newsId } = req.params;
  const { title, description, image_url, is_important, news_type_id } = req.body;

  try {
    // Validate that news exists
    const news = await News.findByPk(newsId);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Check if user is the owner of the news or an admin
    if (news.user_id !== req.userId && req.user_role !== 'admin') {
      return res.status(403).json({ 
        message: 'You are not authorized to update this news' 
      });
    }

    // Validate title if being updated
    if (title && title.trim().length < 3) {
      return res.status(400).json({ message: 'Title must be at least 3 characters long' });
    }

    // Validate description if being updated
    if (description && description.trim().length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters long' });
    }

    // Update news
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_important !== undefined) updateData.is_important = is_important;
    if (news_type_id) updateData.news_type_id = news_type_id;
    
    updateData.updated_at = new Date();

    await News.update(updateData, { where: { news_id: newsId } });

    // Fetch updated news
    const updatedNews = await News.findByPk(newsId);

    res.status(200).json({
      message: 'News updated successfully',
      news: updatedNews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while updating news: ${error.message}` 
    });
  }
};

const deleteNews = async (req, res) => {
  const { newsId } = req.params;

  try {
    // Validate that news exists
    const news = await News.findByPk(newsId);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Check if user is the owner of the news or an admin
    if (news.user_id !== req.userId && req.user_role !== 'admin') {
      return res.status(403).json({ 
        message: 'You are not authorized to delete this news' 
      });
    }

    // Delete news
    await News.destroy({ where: { news_id: newsId } });

    res.status(200).json({
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while deleting news: ${error.message}` 
    });
  }
};

const getOneNews = async (req, res) => {
  const { newsId } = req.params;

  try {
    // Validate that newsId is provided
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // Get single news by ID
    const news = await News.findByPk(newsId);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.status(200).json({
      message: 'News retrieved successfully',
      news: news
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching news: ${error.message}` 
    });
  }
};

const getLastFiveImportantNews = async (req, res) => {
  try {
    // Get the last 5 news flagged as important, ordered by creation date descending
    const importantNews = await News.findAll({
  where: { is_important: true },
  include: [{ model: User, as: 'author', attributes: ['username'] }],  // 👈 add this
  order: [['createdAt', 'DESC']],
  limit: 5
});

    res.status(200).json({
      message: 'Important news retrieved successfully',
      count: importantNews.length,
      news: importantNews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching important news: ${error.message}` 
    });
  }
};

export const newsControllers = {
  createNews,
  getNews,
  getOneNews,
  updateNews,
  deleteNews,
  getLastFiveImportantNews
};
