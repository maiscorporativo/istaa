const express = require('express');
const path = require('path');
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
// ... (routes stay above)
app.use('/api/users', usersRoutes);
app.use('/api/quotes', quotesRoutes);

// Servir o Frontend construído (Pasta dist gerada pelo Vite)
app.use(express.static(path.join(__dirname, '../dist')));

// Redirecionar qualquer outra rota para o index.html do React (SPA Routing)
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
