import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';



const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 統一的敘事系統提示（可依你遊戲世界觀調整）
const SYSTEM_PROMPT = `
You are the Narrator of a short interactive story. 
Write vivid but concise scenes (120-180 words), end with 2-3 numbered choices.
Keep continuity from 'context'.
Return clean markdown only.
`;

app.post('/api/story', async (req, res) => {
  try {
    const { context, playerChoice } = req.body; // 前端送來目前劇情與玩家選擇
    const userPrompt = `
CONTEXT:
${context || '(start)'}
PLAYER_CHOICE:
${playerChoice || '(begin)'}
TASK:
Continue the story from the context. If this is the start, write the opening scene. 
End with numbered choices.
`;

    // ——— 用 SDK（推薦）———
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.9,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = completion.choices?.[0]?.message?.content ?? '…';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`AI server on http://localhost:${PORT}`));
