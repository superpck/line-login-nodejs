import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('login');
});

// Start the server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
