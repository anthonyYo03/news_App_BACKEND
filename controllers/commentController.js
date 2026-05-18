import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';
import News from '../models/news.model.js';
import { Op } from 'sequelize';
import { sendNotification } from '../service/notification.service.js';

const createComment = async (req, res) => {
  const { newsId } = req.params;
  const { message } = req.body;

  try {
    // Validate required fields
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    // Validate message length
    if (message.trim().length < 2) {
      return res.status(400).json({ message: 'Comment must be at least 2 characters long' });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({ message: 'Comment cannot exceed 1000 characters' });
    }

    // Create comment (only authenticated users: readers and journalists)
    const newComment = await Comment.create({
      message: message.trim(),
      user_id: req.userId,
      news_id: newsId
    });

    // Get the comment with user details
    const commentWithUser = await Comment.findByPk(newComment.comment_id, {
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      }
    });

    // Send notification to news owner
    const news = await News.findByPk(newsId);
    const commenter = await User.findByPk(req.userId);
    await sendNotification({
      recipients: [news.user_id], // only the owner of the post
      type: "comment",
      title: "New Comment",
      message: `${commenter.username} commented on your post`,
      relatedId: newsId,
      relatedModel: "News"
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while creating comment: ${error.message}` 
    });
  }
};

const getComments = async (req, res) => {
  const { newsId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    // Validate required fields
    if (!newsId) {
      return res.status(400).json({ message: 'News ID is required' });
    }

    // Get all comments for the news post with pagination
    const comments = await Comment.findAll({
      where: { news_id: newsId },
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count of comments for the news
    const totalCount = await Comment.count({
      where: { news_id: newsId }
    });

    res.status(200).json({
      message: 'Comments retrieved successfully',
      newsId: newsId,
      totalComments: totalCount,
      comments: comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching comments: ${error.message}` 
    });
  }
};

const getOneComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    // Validate required fields
    if (!commentId) {
      return res.status(400).json({ message: 'Comment ID is required' });
    }

    // Get single comment with user details
    const comment = await Comment.findByPk(commentId, {
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({
      message: 'Comment retrieved successfully',
      comment: comment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching comment: ${error.message}` 
    });
  }
};

const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { message } = req.body;

  try {
    // Validate required fields
    if (!commentId) {
      return res.status(400).json({ message: 'Comment ID is required' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    // Validate message length
    if (message.trim().length < 2) {
      return res.status(400).json({ message: 'Comment must be at least 2 characters long' });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({ message: 'Comment cannot exceed 1000 characters' });
    }

    // Find the comment
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Authorization check: only comment owner or admin can update
    if (comment.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'You are not authorized to update this comment' 
      });
    }

    // Update comment
    await Comment.update(
      { message: message.trim() },
      { where: { comment_id: commentId } }
    );

    // Get updated comment with user details
    const updatedComment = await Comment.findByPk(commentId, {
      include: {
        model: User,
        attributes: ['user_id', 'username', 'email']
      }
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while updating comment: ${error.message}` 
    });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    // Validate required fields
    if (!commentId) {
      return res.status(400).json({ message: 'Comment ID is required' });
    }

    // Find the comment
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Authorization check: only comment owner or admin can delete
    if (comment.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'You are not authorized to delete this comment' 
      });
    }

    // Delete comment
    await Comment.destroy({ where: { comment_id: commentId } });

    res.status(200).json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while deleting comment: ${error.message}` 
    });
  }
};

export const commentControllers = {
  createComment,
  getComments,
  getOneComment,
  updateComment,
  deleteComment
};
