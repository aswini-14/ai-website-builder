require('dotenv').config();
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const generateRoutes = require('./routes/generate');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/generate', generateRoutes);
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
