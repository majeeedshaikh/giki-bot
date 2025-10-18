// api/whatsapp.js
// WhatsApp Cloud API webhook (Vercel serverless function) that
// 1) verifies webhook (GET) and
// 2) answers inbound messages (POST) using Groq + your GIKI policy text.

import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

// ----- ENV -----
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;           // e.g. giki_whatsapp_verify_123
const WP_TOKEN     = process.env.WHATSAPP_TOKEN;                   // permanent System User token
const PHONE_ID     = process.env.WHATSAPP_PHONE_NUMBER_ID;         // 746788998528020
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ----- INIT -----
const groqClient = new Groq({ apiKey: GROQ_API_KEY });

// Cache the PDF content so we don’t read disk every request
let cachedPdf = null;
function getPDFContent() {
  if (cachedPdf) return cachedPdf;
  try {
    const pdfPath = path.join(process.cwd(), 'pdf-content.txt');
    cachedPdf = fs.readFileSync(pdfPath, 'utf8');
    return cachedPdf;
  } catch (err) {
    console.error('[whatsapp] Failed to read pdf-content.txt:', err);
    return '';
  }
}

// Build the same style system prompt you use in chat.js
function buildSystemPrompt() {
  const pdfText = getPDFContent();
  return `You are a helpful assistant that answers questions based on the GIKI Undergraduate Admissions Policy document. 

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
}

// ---- LLM call (Groq) ----
async function askGroq(userText) {
  const systemPrompt = buildSystemPrompt();
  const resp = await groqClient.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userText }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1000
  });
  return (resp.choices?.[0]?.message?.content || '').trim()
      || "This information is not available in the GIKI admissions policy document.";
}

// ---- WhatsApp send helper (auto-chunks long text) ----
const MAX_WA_CHARS = 4000; // WA limit ~4096; keep a little headroom
async function sendWhatsAppText(to, text) {
  const url = `https://graph.facebook.com/v24.0/${PHONE_ID}/messages`;

  // chunk long replies
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_WA_CHARS) {
    chunks.push(text.slice(i, i + MAX_WA_CHARS));
  }

  for (const part of chunks) {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: part }
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text().catch(() => '');
      throw new Error(`WA send error ${r.status}: ${t}`);
    }
  }
}

// ---- Extract inbound text safely (text / buttons / list replies) ----
function extractIncomingText(change) {
  const msg = change?.value?.messages?.[0];
  if (!msg) return { from: null, text: null };

  const from = msg.from || null;

  if (msg.text?.body) return { from, text: (msg.text.body || '').trim() };

  // basic interactive support
  if (msg.button?.text) return { from, text: (msg.button.text || '').trim() };
  if (msg.interactive?.button_reply?.title) {
    return { from, text: msg.interactive.button_reply.title.trim() };
  }
  if (msg.interactive?.list_reply?.title) {
    return { from, text: msg.interactive.list_reply.title.trim() };
  }

  return { from, text: null };
}

// ---- Vercel serverless entry ----
export default async function handler(req, res) {
  try {
    // Webhook verification (GET)
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge || '');
      }
      return res.status(403).send('Forbidden');
    }

    // Inbound messages (POST)
    if (req.method === 'POST') {
      const body = req.body || {};

      // Process each message serially (simple + safe)
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const { from, text } = extractIncomingText(change);
          if (!from || !text) continue;

          try {
            const answer = await askGroq(text);
            await sendWhatsAppText(from, answer);
          } catch (e) {
            console.error('[whatsapp] pipeline failed:', e?.message || e);
            // best-effort fallback
            try { await sendWhatsAppText(from, 'Sorry — having trouble replying right now. Please try again.'); } catch {}
          }
        }
      }

      return res.status(200).json({ status: 'ok' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method Not Allowed');
  } catch (err) {
    console.error('[whatsapp] fatal:', err?.message || err);
    return res.status(500).json({ error: 'internal error' });
  }
}
