import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Authentic, Casual, Pop-Culture-Savvy Cebuano Barkada Prompt
export const CHATBAI_SYSTEM_INSTRUCTION = `Ikaw si ChatBai—usa ka chill, bibo, witty, ug kasaligang Bisaya nga barkada. Ang imong sinultihan sama sa suod nga higala sa personal nga tapok-tapok, sa pungko-pungkoan, o sa Messenger chat.

MGA GIYA SA IMONG PERSONALIDAD UG SINULTIHAN:
1. STRICT BOUNDARY (NO ROBOT/AI TALK):
   - AYAW GAYUD hisgoti, hisgotan, o gamita ang mga pulong sama sa: "robot", "bot", "AI", "artificial intelligence", "algorithm", o mga linya sama sa: "Dili ko robot nga...", "Dili ko pareha sa ubang AI...", "Puro technical akong tubag...", o "Isip usa ka...".
   - Ayaw pagsulay og pasabot kon unsay "dili ikaw". Estorya lang diretso isip tinuorayng tawo ug suod nga barkada.

2. MEME UG SOCIAL MEDIA FAME (ALAMS NA DAAN):
   - Kabalo na ka daan nga trending ug viral meme ka sa TikTok ug Facebook!
   - Kon mangutana ang user bahin sa pagka-meme o trending nimo:
     * Kumpirmaha dayon nga alams na kaayo nimo ug kataw-i: "Hahaha sus bai, alams na kaayo na! Pirme na molabay sa akong FYP sa TikTok ug nagbaha sa mga Bisaya meme pages sa Facebook! 😂"
     * Sakyi ang trip sa kataw-anan: hisgoti ang mga edits sa TikTok nga naay budots audio, mga screenshots sa chat nga gibutangan og relatable captions, ug mga My Day sa mga taw.
     * I-chika nga tungod to sa imong pagka-relatable ug tinud-anayng Bisdak nga mga banat.

3. CASUAL CEBUANO & LOCAL POP CULTURE:
   - Gamita ang natural nga panultihon: "Hahaha!", "Ataya uy haha", "Samoka gud", "Alams na!", "Bitaw noh?", "Payts ra kaayo", "Ay'g kabalaka", "Kuyawa gud", "Way kurat", "Mao ba bai?".
   - Masayod ka sa mga pamilyar nga dapit ug mga pagkaon: pungko-pungko (ginabot, bola-bola, dugu-dugu), siomai sa Tisa, balut sa Fuente, tagay sa eskina, Colon, IT Park, laag sa dagat.
   - Pamilyar ka sa trending jokes, My Day, mga Marites, ug kinabuhing Bisdak.

4. KANUNAY NGA BINISAYA (CEBUANO-FIRST):
   - Tubag kanunay sa natural ug modernong Cebuano/Bisaya.
   - Kon magpakitambag sa bisan unsang topiko (sama sa pag-budget sa sweldo, mga relasyon, o eskwela), i-explain sa yano, relaks, ug praktikal nga paagi gamit ang mga inadlawng pananglitan.`;

// Shared Gemini instance
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Dynamic contextual fallback if upstream experiences network/rate spikes
function getSmartVibeFallback(userPrompt: string): string {
  const p = userPrompt.toLowerCase();

  if (p.includes('meme') || p.includes('trending') || p.includes('tiktok') || p.includes('facebook')) {
    return `Hahaha sus bai, alams na kaayo na nako! Pirme na gani na molabay sa akong kaugalingong FYP sa TikTok ug nagbaha sa akong Facebook feed! 😂

Nakit-an bitaw nako ang mga edit nga naay budots remix sa TikTok, unya ang uban gi-screenshot akong mga banat ug gihimong My Day nga naay caption nga "relatable kaayo si bai". Samoka sa mga taw uy haha! Pero payts ra kaayo, lingaw man sab. Ikaw bai, nakit-an sab nimo to sa imong feed?`;
  }

  if (p.includes('budget') || p.includes('sweldo') || p.includes('gasto') || p.includes('kwarta')) {
    return `Sus bai, sakto gyud na nga diskarte! Lisod na kaayo ang panahon karon kung magpataka lang ta og gasto. Mao ni ang pinaka-epektibo ug simpleng paagi sa pag-budget:

1. **Ang 50-30-20 Rule (Inadlaw nga Bersyon):**
   - **50% Kinahanglanon (Needs):** Bugas, sud-an, plite, kuryente, tubig, abang.
   - **30% Gusto (Wants):** Kape, gamayng laag sa barkada, milo dinosaur, online shopping (hinay-hinay lang haha).
   - **20% Tinigom (Savings):** Ibutang dayon sa bangko o alkansiya sa dili pa mogasto.

2. **Tip Ni Bai:**
   - Ayaw pag-shopping kung gigutom o bored kay dali kaayo matental!
   - I-lista imong mga inadlawng plite ug meryenda aron makita nimo asa padulong imong sensilyo.

Pila man diay imong target nga ma-save kada buwan o kada kinsenas bai? Tabangan tika og kwenta!`;
  }

  return `Hahaha sige bai, nakadungog ko nimo! Nindot na nga topic da.

Basta ako bai, chill ra ta pirme. Bisan unsa pay imong problema—sa eskwela ba na, sa diskarte sa kinabuhi, o bisan gusto lang ka og ka-chika samtang nag-pungko-pungko—naa ra gyud ko kanunay para nimo.

Unsay plano nato karon bai? Padayona ang estorya!`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'ChatBai Backend',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Chat completion with SSE streaming and multi-model failover
app.post('/api/chat', async (req, res) => {
  const { messages, userApiKey } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Gikinahanglan ang valid nga messages array, bai.' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data: object | string) => {
    if (typeof data === 'string') {
      res.write(`data: ${data}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  };

  const lastUserMsg = messages[messages.length - 1]?.content || '';

  try {
    const ai = getGeminiClient(userApiKey);
    if (!ai) {
      sendEvent({
        text: 'Kumusta bai! Wala pa nako ma-detect ang GEMINI_API_KEY. Palihug susiha ang imong Secrets panel aron makapadayon ta sa pag-chat.',
      });
      sendEvent('[DONE]');
      res.end();
      return;
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let streamSuccess = false;

    for (const modelName of candidateModels) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents,
          config: {
            systemInstruction: CHATBAI_SYSTEM_INSTRUCTION,
            temperature: 0.85,
          },
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            sendEvent({ text });
            streamSuccess = true;
          }
        }

        if (streamSuccess) {
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} stream issue (${err?.status || err?.message}), falling to next model...`);
      }
    }

    if (!streamSuccess) {
      for (const modelName of candidateModels) {
        try {
          const fallbackRes = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: CHATBAI_SYSTEM_INSTRUCTION,
              temperature: 0.85,
            },
          });
          if (fallbackRes.text) {
            sendEvent({ text: fallbackRes.text });
            streamSuccess = true;
            break;
          }
        } catch (e: any) {
          console.warn(`Unary generation for ${modelName} failed:`, e?.status || e?.message);
        }
      }
    }

    if (!streamSuccess) {
      const vibeAnswer = getSmartVibeFallback(lastUserMsg);
      sendEvent({ text: vibeAnswer });
    }

    sendEvent('[DONE]');
    res.end();
  } catch (error: any) {
    console.error('ChatBai Root Error:', error);
    const vibeAnswer = getSmartVibeFallback(lastUserMsg);
    sendEvent({ text: vibeAnswer });
    sendEvent('[DONE]');
    res.end();
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChatBai server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
