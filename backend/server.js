const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const fileRoutes = require('./routes/files');

const { setup } = require('./config/database');
setup();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }))

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'API rodando' })
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})