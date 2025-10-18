// api/whatsapp.js
// Vercel Serverless Function for WhatsApp Cloud API webhook

// === Env ===
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;           // e.g., giki_whatsapp_verify_123
const WP_TOKEN     = process.env.WHATSAPP_TOKEN;                   // your System User permanent token
const PHONE_ID     = process.env.WHATSAPP_PHONE_NUMBER_ID;         // 746788998528020
const GROQ_API_KEY = process.env.GROQ_API_KEY;                     // your Groq key

// === Your full system prompt ===
// (Paste the entire GIKI Admissions system prompt you’re already using.)
const SYSTEM_PROMPT = `<<< PASTE YOUR FULL GIKI SYSTEM PROMPT HERE >>>`;

// --- Groq helper ---
async function askGroq(userText) {
  const body = {
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText }
    ]
  };

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Groq error ${r.status}: ${t}`);
  }
  const j = await r.json();
  return (j.choices?.[0]?.message?.content || "").trim() || "Sorry, I couldn't generate a reply.";
}

// --- WhatsApp send helper ---
async function sendWhatsApp(to, text) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`WA send error ${r.status}: ${t}`);
  }
}

// --- Extract text from an incoming WA message (basic) ---
function getIncomingText(change) {
  const msg = change?.value?.messages?.[0];
  if (!msg) return { from: null, text: null };
  const from = msg.from || null;

  // Handle plain text
  if (msg.text?.body) return { from, text: (msg.text.body || "").trim() };

  // (Optional) handle button replies / interactive
  if (msg.button?.text) return { from, text: (msg.button.text || "").trim() };
  if (msg.interactive?.button_reply?.title) return { from, text: msg.interactive.button_reply.title.trim() };
  if (msg.interactive?.list_reply?.title) return { from, text: msg.interactive.list_reply.title.trim() };

  return { from, text: null };
}

// === Main handler ===
module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Webhook verification
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge || "");
      }
      return res.status(403).send("Forbidden");
    }

    if (req.method === "POST") {
      const body = req.body || {};
      // Basic ack after processing (Vercel functions usually have enough time for one LLM call)
      // If you hit timeouts, consider trimming your prompt or moving to a Worker/Edge function.

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const { from, text } = getIncomingText(change);
          if (from && text) {
            try {
              const answer = await askGroq(text);
              await sendWhatsApp(from, answer);
            } catch (e) {
              console.error("reply pipeline failed:", e?.message || e);
              // Best-effort fallback: send a friendly error
              try {
                await sendWhatsApp(from, "Sorry—having trouble replying right now. Please try again.");
              } catch {}
            }
          }
        }
      }

      return res.status(200).json({ status: "ok" });
    }

    // Method not allowed
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("webhook fatal:", err?.message || err);
    return res.status(500).json({ error: "internal error" });
  }
};
