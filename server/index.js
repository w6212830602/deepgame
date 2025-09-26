// server/index.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
// Node 18+ 內建 fetch，不需安裝其他套件

const app = express();
app.use(cors());
app.use(express.json());

const PROVIDER = process.env.PROVIDER || 'ollama';

// 敘事指令
const SYSTEM_PROMPT = `
You are the Narrator of a short interactive story.
Write vivid but concise scenes (120-180 words), then end with 2-3 numbered choices (1) 2) 3)).
Keep strict continuity from 'context'. Return plain text only.
`;

// 健康檢查
app.get('/api/health', async (_req, res) => {
  const info = { ok: true, provider: PROVIDER };
  if (PROVIDER === 'ollama') {
    try {
      const base = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const r = await fetch(`${base}/api/tags`);
      info.ollama = r.ok ? 'up' : 'down';
      info.model = process.env.OLLAMA_MODEL || 'llama3.1';
    } catch {
      info.ollama = 'down';
    }
  } else {
    info.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    info.hasKey = !!process.env.OPENAI_API_KEY;
  }
  res.json(info);
});

// === 核心：產生下一段劇情 ===
app.post('/api/story', async (req, res) => {
  const { context = '', playerChoice = '' } = req.body || {};

  const userPrompt = `CONTEXT:\n${context || '(start)'}\n\nPLAYER_CHOICE:\n${playerChoice || '(begin)'}\n\nTASK:\nContinue the story and end with numbered choices.`;

  try {
    let text = '';

    if (PROVIDER === 'ollama') {
      const base = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const model = process.env.OLLAMA_MODEL || 'llama3.1';

      // 用 /api/chat，一次性回覆（非串流）
      const r = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          options: {
            temperature: 0.8,
            num_predict: 220,   // 類似 max_tokens
          },
          stream: false
        })
      });

      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Ollama HTTP ${r.status}: ${err}`);
      }
      const data = await r.json();
      text = data?.message?.content?.trim();
      if (!text) throw new Error('Empty response from Ollama');

    } else {
      // 若日後要切回雲端 OpenAI，可放回先前的 openai SDK 呼叫
      throw new Error('PROVIDER=openai not configured in this file');
    }

    return res.json({ text });

  } catch (err) {
    console.error('[story][ERROR]', err.message || err);
    return res.status(500).json({
      error: 'AI request failed',
      detail: err.message || String(err)
    });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`AI server (${PROVIDER}) on http://localhost:${PORT}`);
});
