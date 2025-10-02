const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if PDF content file exists
    const pdfPath = path.join(process.cwd(), 'pdf-content.txt');
    let pdfLoaded = false;
    let pdfLength = 0;

    try {
      const pdfContent = fs.readFileSync(pdfPath, 'utf8');
      pdfLoaded = true;
      pdfLength = pdfContent.length;
    } catch (error) {
      console.log('PDF content file not found');
    }

    res.status(200).json({
      status: 'healthy',
      pdf_loaded: pdfLoaded,
      pdf_length: pdfLength,
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}
