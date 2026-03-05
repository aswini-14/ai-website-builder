require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const generateRoutes = require('./routes/generate');
const refineRoute = require("./routes/refine");
const historyRoutes = require("./routes/history");
const explainRoute = require("./routes/explain");
const deployRoutes = require("./routes/deploy");
const siteRoutes = require("./routes/site");
const figmaRoutes = require("./routes/figma");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/explain", explainRoute);
app.use('/api/auth', authRoutes);
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.use('/generate', generateRoutes);
app.use("/refine", refineRoute);
app.use("/history", historyRoutes);
app.use("/explain", explainRoute);
app.use("/deploy", deployRoutes);
app.use("/site", siteRoutes);
app.use("/figma", figmaRoutes);
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
