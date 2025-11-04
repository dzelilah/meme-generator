const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
const configRouter = require('./routes/config');
const memeRouter = require('./routes/meme');

app.use('/api/config', configRouter);
app.use('/api/meme', memeRouter);

app.get('/', (req, res) => res.json({ message: 'Backend is running' }));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
