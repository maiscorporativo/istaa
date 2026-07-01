const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/organizations');
const tagsRoutes = require('./routes/tags');
const usersRoutes = require('./routes/users');
const quotesRoutes = require('./routes/quotes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quotes', quotesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
