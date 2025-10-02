const express = require('express');
const path = require('path');
const fs = require('fs');

// Import our serverless functions
const chatHandler = require('./api/chat');
const healthHandler = require('./api/health');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', (req, res) => {
  chatHandler(req, res);
});

app.get('/api/health', (req, res) => {
  healthHandler(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GIKI Chatbot running locally at http://localhost:${PORT}`);
  console.log(`📄 PDF content loaded: ${fs.existsSync('pdf-content.txt') ? 'Yes' : 'No'}`);
  console.log(`🤖 Ready to chat!`);
});
