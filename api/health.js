export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    status: 'healthy',
    message: 'GIKI Chatbot API is working!'
  });
}
