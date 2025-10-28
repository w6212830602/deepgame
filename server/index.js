import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PROVIDER = process.env.PROVIDER || 'ollama';

// Narrator instructions for all generations
const SYSTEM_PROMPT = `
You are the Narrator of a short interactive story.
Your job:
- Continue the scene for the player.
- Be vivid and cinematic but concise (about 120-180 words of story before choices).
- Then present 2 or 3 numbered choices in this exact format:
1) ...
2) ...
3) ...
- Choices must clearly describe what the player can do next.
- DO NOT end in the middle of a sentence.
- DO NOT end in the middle of a choice.
- ALWAYS finish the last choice fully, then stop.
- Reply with plain text only, no markdown formatting.
`;

// Health check endpoint (optional but nice to have)
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

// Main story generation endpoint
app.post('/api/story', async (req, res) => {
  const { context = '', playerChoice = '' } = req.body || {};

  const userPrompt = `
CONTEXT SO FAR:
${context || '(start of story)'}

PLAYER CHOICE / ACTION:
${playerChoice || '(begin the story)'}

TASK:
Continue the story from this exact point in time. Respect continuity.
Write ~120-180 words of narrative in second person ("you").
Then ALWAYS give 2 or 3 possible next actions as numbered choices using this exact format:
1) ...
2) ...
3) ...
Each choice must describe a distinct possible action or decision by the player.
Do not end your output before listing the choices.
If you reach the end of your narrative and haven't written the choices yet, immediately add them.

Rules you MUST follow:
- Do NOT jump to an ending unless it makes sense.
- Do NOT skip directly to happily-ever-after.
- Do NOT stop writing in the middle of a sentence.
- Do NOT stop writing in the middle of a choice line.
- The final line of your answer MUST be the end of a fully-written choice.
- Output plain text only (no **bold**, no markdown).
`;

  try {
    let text = '';

    if (PROVIDER === 'ollama') {
      const base = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const model = process.env.OLLAMA_MODEL || 'llama3.1';

      // Call local Ollama server
      const r = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT.trim() },
            { role: 'user', content: userPrompt.trim() },
          ],
          options: {
            temperature: 0.7,   
            num_predict: 500,   
          },
          stream: false
        })
      });

      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Ollama HTTP ${r.status}: ${err}`);
      }

      const data = await r.json();

      // Ollama's /api/chat returns { message: { role, content }, ... }
      text = data?.message?.content?.trim();

      if (!text) {
        throw new Error('Empty response from Ollama');
      }

    } else {
      // If in the future you add OpenAI etc, handle here.
      throw new Error('PROVIDER=openai not implemented in this server');
    }

    // success
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
