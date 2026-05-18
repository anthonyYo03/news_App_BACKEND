import User from '../models/user.model.js';

export const onlyAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found. Please log in.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user || user.user_type_id !== 3) {
      return res.status(403).json({ message: 'Access Denied! Only Admin are allowed for that action.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while checking user role' });
  }
};

export const onlyJournalist = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found. Please log in.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user || user.user_type_id !== 1) {
      return res.status(403).json({ message: 'Access Denied! Only Journalists are allowed for that action.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while checking user role' });
  }
};

export const onlyJournalistAndReader = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found. Please log in.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user || (user.user_type_id !== 1 && user.user_type_id !== 2)) {
      return res.status(403).json({ message: 'Access Denied! Only Journalists and Readers are allowed for that action.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while checking user role' });
  }
};

export const onlyJournalistAndAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found. Please log in.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user || (user.user_type_id !== 1 && user.user_type_id !== 3)) {
      return res.status(403).json({ message: 'Access Denied! Only Journalists and Admins are allowed for that action.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while checking user role' });
  }
};
