# GIKI Admissions Policy Chatbot

A web-based chatbot that answers questions about GIKI's Undergraduate Admissions Policy using the Groq API. Deployable on Vercel for free hosting.

## Features

- 🤖 AI-powered responses using Groq's LLaMA model
- 📄 Complete PDF document integration as knowledge base
- 💬 Modern, responsive chat interface
- 🎨 Beautiful UI with gradient design
- ⚡ Real-time typing indicators
- 📱 Mobile-friendly design
- 🚀 **Serverless deployment on Vercel (FREE!)**
- 🌐 **No server needed - works 24/7**

## Quick Deployment to Vercel (Recommended)

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/giki-admissions-chatbot)

### Option 2: Manual Deploy
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Your chatbot will be live** at a URL like: `https://your-project.vercel.app`

📖 **Detailed deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Create a `.env` file in the root directory:

```bash
# .env
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from: https://console.groq.com/keys

### 3. Run Locally (Choose one method)

**Method A: Simple Local Server (Recommended for testing)**
```bash
npm run local
```

**Method B: Vercel Dev (Requires Vercel login)**
```bash
vercel dev
```

### 4. Access the Chatbot

Open your web browser and navigate to `http://localhost:3000`

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Chat Test:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the admission requirements for GIKI?"}'
```

## How It Works

1. **PDF Processing**: The PDF content is pre-extracted and stored in `pdf-content.txt`
2. **Knowledge Base**: The entire PDF content is used as context in the system prompt for the Groq API
3. **Serverless Functions**: Vercel handles the API endpoints as serverless functions
4. **Chat Interface**: Users can ask questions about GIKI admissions policy through the web interface
5. **AI Responses**: The Groq API (LLaMA 3.3 70B model) generates responses based on the PDF content

## API Endpoints

- `GET /` - Serves the main chatbot interface
- `POST /api/chat` - Handles chat messages (serverless function)
- `GET /api/health` - Health check endpoint (serverless function)

## Configuration

The Groq API key is configured in `vercel.json` and environment variables. The key is automatically deployed with the project.

## File Structure

```
giki-bot/
├── api/
│   ├── chat.js                    # Chat API serverless function
│   └── health.js                  # Health check serverless function
├── index.html                     # Chatbot frontend
├── pdf-content.txt                # Pre-extracted PDF content
├── vercel.json                    # Vercel configuration
├── package.json                   # Node.js dependencies
├── DEPLOYMENT.md                  # Detailed deployment guide
└── README.md                      # This file
```

## Benefits of Vercel Deployment

- ✅ **Free hosting** with generous limits
- ✅ **No server maintenance** required
- ✅ **Automatic HTTPS** and global CDN
- ✅ **Serverless scaling** - handles traffic spikes automatically
- ✅ **Easy deployment** with one command
- ✅ **Custom domains** supported
- ✅ **Environment variables** securely managed

## Troubleshooting

- If deployment fails, check that all files are committed to git
- If API errors occur, verify the Groq API key in environment variables
- Check Vercel function logs in the dashboard for debugging

## Technologies Used

- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Groq API with LLaMA 3.3 70B model
- **PDF Processing**: Pre-extracted text file
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Modern CSS with gradients and animations
- **Deployment**: Vercel (serverless platform)
