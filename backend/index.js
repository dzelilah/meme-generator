const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => res.json({ message: 'Backend is running' }));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
