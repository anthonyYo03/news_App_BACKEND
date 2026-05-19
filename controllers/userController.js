import User from '../models/user.model.js';
import Type from '../models/type.model.js';
import News from '../models/news.model.js';
import Comment from '../models/comment.model.js';
import Share from '../models/share.model.js';
import Like from '../models/like.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../middlewares/auth.js';
import { secretKey } from '../middlewares/config.js';
import validator from "validator";
import { Resend } from 'resend';
import { Op } from 'sequelize';


const resend = new Resend(process.env.RESEND_API_KEY);
const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to send email');
  }
};



const registerUser = async (req, res) => {
  const { email, username, password,user_type_id} = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists' });
    }

   
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({ 
      email, 
      username, 
      password: hash,
      user_type_id
    });

    res.status(201).send({ 
      message: 'User registered Successfully.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `An error occurred!! ${error}` });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send({ message: 'Invalid login credentials' });
    }

    const payload = { userId: user.user_id };
    const token = generateToken(payload);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 6 * 60 * 60 * 1000 // 6 hours
    });
    const userType = await Type.findOne({ where: { user_type_id: user.user_type_id } });
    res.status(200).json({ message: 'Login successful',
      type: userType.type


     });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `An error occurred while logging in ${error}` });
  }
};

const logoutUser = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'An error occurred while logging out' });
  }
}

const requestPasswordReset = async (req, res) => {
  
 const { email } = req.body; 
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }
  console.log('📧 Sending reset email to:', user.email);  // 👈 add this
    console.log('🔗 Reset URL will be:', `${process.env.FRONTEND_URL}/reset-password`);  //
    const secret = secretKey + user.password;
    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      secret,
      { expiresIn: '1h' }
    );

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?id=${user.user_id}&token=${token}`;

    await sendEmail(
      user.email,
      'Password Reset Request',
      `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">Reset Password</a>
        <p>Link: ${resetURL}</p>
        <p>Expires in 1 hour.</p>
      `
    );

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('❌ Email Error:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message
    });
  }
};


const resetPassword = async (req, res) => {
  const { id, token } = req.query;
  const { password } = req.body;

if (!validator.isStrongPassword(password)) {
  return res.status(400).json({ message: "Password is too weak" });
}

  try {
    // Validate inputs
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (!id || !token) {
      return res.status(400).json({ message: 'Invalid reset link' });
    }

    
    const user = await User.findOne({ where: { user_id: id } });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist!' });
    }

    // Verify token using the same secret (secretKey + old password hash)
    const secret = secretKey + user.password;

    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

 
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await User.update(
      { password: encryptedPassword },
      { where: { user_id: id } }
    );

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

const getUsers = async (req, res) => {
  const { limit = 10, offset = 0, user_type_id } = req.query;

  try {
    // Build filter object
    const whereFilter = {};
    if (user_type_id) {
      whereFilter.user_type_id = parseInt(user_type_id);
    }

    // Get users with pagination sorted by createdAt (newest first)
    const users = await User.findAll({
      where: whereFilter,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Get total count of users (with filter applied)
    const totalCount = await User.count({ where: whereFilter });

    res.status(200).json({
      message: 'Users retrieved successfully',
      totalUsers: totalCount,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `An error occurred!! ${error}` });
  }
};

const createUser = async (req, res) => {
  const { email, username, password, user_type_id } = req.body;

  try {
    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password is too weak' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user with specified role (default to 'reader' if not specified)
    const newUser = await User.create({
      email,
      username,
      password: hash,
      user_type_id
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        username: newUser.username,
        user_type_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `An error occurred while creating user: ${error.message}` });
  }
}

const updateUserByAdmin = async (req, res) => {
  const { userId } = req.params;
  const { email, username, user_type_id } = req.body;

  try {
    // Validate that user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate email if being updated
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if new email already exists (excluding current user)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email, user_id: { [Op.ne]: userId } }
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Check if new username already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        where: { username, user_id: { [Op.ne]: userId } }
      });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }
    }

    // Update user
    const updateData = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (user_type_id) updateData.user_type_id = user_type_id;

    await User.update(updateData, { where: { user_id: userId } });

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        user_id: user.user_id,
        email: updateData.email || user.email,
        username: updateData.username || user.username,
        user_type_id: updateData.user_type_id || user.user_type_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `An error occurred while updating user: ${error.message}` });
  }
}


const updateUserByJournalistOrReader = async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  try {
    // Validate that user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        where: { username, user_id: { [Op.ne]: userId } }
      });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;

    await User.update(updateData, { where: { user_id: userId } });

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        user_id: user.user_id,
        email: user.email, // returned but never modified
        username: updateData.username || user.username,
        user_type_id: user.user_type_id // returned but never modified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `An error occurred while updating user: ${error.message}` });
  }
};


const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate that user exists
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin users
    if (userToDelete.user_type_id === 3) {
      return res.status(403).json({ 
        message: 'Cannot delete a user with admin role' 
      });
    }
await Comment.destroy({ where: { user_id: userId } });
await Like.destroy({ where: { user_id: userId } });
await Share.destroy({ where: { user_id: userId } });
    // Delete user's news articles first to avoid foreign key constraint
    await News.destroy({ where: { user_id: userId } });

    // Delete user
    await User.destroy({ where: { user_id: userId } });

    

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `An error occurred while deleting user: ${error.message}` });
  }
}

const getOneUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate that userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get single user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        user_type_id: user.user_type_id,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching user: ${error.message}` 
    });
  }
}

export const userControllers = 
{ registerUser,
  loginUser,
  logoutUser, 
  getUsers,
  getOneUser,
  requestPasswordReset,
  resetPassword,
  createUser,
  updateUserByAdmin,
  updateUserByJournalistOrReader,
  deleteUser,
};