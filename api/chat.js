import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

// Initialize Groq client
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// PDF content (we'll extract this once and store it)
let pdfContent = null;

// Function to extract PDF content (we'll use a pre-extracted version)
function getPDFContent() {
  if (pdfContent) return pdfContent;
  
  // For Vercel deployment, we'll use a pre-extracted text file
  try {
    const pdfPath = path.join(process.cwd(), 'pdf-content.txt');
    pdfContent = fs.readFileSync(pdfPath, 'utf8');
    return pdfContent;
  } catch (error) {
    console.error('Error reading PDF content:', error);
    return null;
  }
}

export default async function handler(req, res) {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Get PDF content
    const pdfText = getPDFContent();
    if (!pdfText) {
      return res.status(500).json({ error: 'PDF content not available' });
    }

    const systemPrompt = `You are a helpful assistant that answers questions based on the GIKI Undergraduate Admissions Policy document. 

Here is the complete document content:

${pdfText}

IMPORTANT INSTRUCTIONS:
1. Keep responses CONCISE and to the point (maximum 3-4 sentences unless specifically asked for detailed information)
2. Use clear, simple language
3. Format responses with proper line breaks and bullet points when listing multiple items
4. If the question cannot be answered from the document, say "This information is not available in the GIKI admissions policy document."
5. Focus on the most relevant information first
6. Use markdown formatting for better readability (use **bold** for emphasis, bullet points with - or *)

Answer the user's question based on the information provided in this document.`;

    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000
    });

    const answer = response.choices[0].message.content;

    res.status(200).json({
      response: answer,
      status: 'success'
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).json({
      error: 'Sorry, I encountered an error while processing your request.',
      details: error.message
    });
  }
}
