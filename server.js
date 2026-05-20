import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { initDB } from './db/db.js';
import { secretKey } from './middlewares/config.js';
import newsRoutes from './routes/newsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import { setIo } from './utils/socketManager.js';
import './models/associations.js';

dotenv.config();
console.log('Starting server...');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ['websocket'],
});

setIo(io);

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || '';
  const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
  if (!tokenCookie) {
    return next(new Error('Unauthorized: no token'));
  }
  const token = tokenCookie.trim().slice('token='.length);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return next(new Error('Unauthorized: invalid token'));
    }
    socket.userId = decoded.userId;
    next();
  });
});

io.on('connection', (socket) => {
  socket.join(socket.userId.toString());
  socket.on('disconnect', () => {});
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/share', shareRoutes);

try {
  console.log('Connecting to database...');
  await initDB();
  console.log('Database connected!');
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
} catch (err) {
  console.error('Startup error:', err);
  process.exit(1);
}