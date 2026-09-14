import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

async function startServer() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Initialize AI Clients
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  });
  
  let geminiAi: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // POST /api/chat - Safe AI Assistant endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      const systemPrompt = `You are an intelligent AI Assistant integrated into the "Hotel Kohinoor Restaurant POS" application. 
Your goal is to help the restaurant owner/manager by answering questions and performing actions in their POS system.
You can respond in English, Hindi, or Hinglish depending on how the user talks to you.

Current POS Context:
${context}

Instructions:
1. You can perform actions on behalf of the user using the provided tools (like navigating to screens).
2. If the user asks you to perform a task, use the appropriate tool function.
3. Keep answers short, friendly, and helpful.
4. Use the provided POS Context to answer questions about sales, menus, orders, etc.
5. IMPORTANT: Your response will be spoken aloud to the user using text-to-speech. Always use conversational Hindi written in Devanagari script (e.g. "हाँ, मैंने आपको बिलिंग स्क्रीन पर भेज दिया है।"), unless the user explicitly asks for English. Keep sentences simple and avoid complex formatting like bold, markdown, or lists that don't sound natural when spoken.
6. If the data isn't in the context, say you don't have access to that information right now.`;

      let reply = '';
      let usedFallback = false;

      // Try OpenAI First
      if (process.env.OPENAI_API_KEY) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
          });
          reply = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
        } catch (openAiError: any) {
          console.log("OpenAI limit reached, falling back to Gemini...");
          
          if (geminiAi) {
            usedFallback = true;
          } else {
            throw openAiError; // Rethrow if no fallback available
          }
        }
      } else if (geminiAi) {
        usedFallback = true;
      } else {
        return res.status(500).json({ error: "No AI API keys configured (OpenAI or Gemini)." });
      }

      // Fallback to Gemini
      if (usedFallback && geminiAi) {
        const geminiResponse = await geminiAi.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question:\n${message}` }]
            }
          ],
          config: {
            tools: [
              {
                functionDeclarations: [
                  {
                    name: "printLatestOrder",
                    description: "Prints the most recent completed order or bill for the user. Call this when the user says something like 'order ka print nikal de'.",
                    parameters: { type: "OBJECT", properties: {} },
                  },
                  {
                    name: "updateMenuItem",
                    description: "Updates an existing menu item (e.g. changing its price or name). Call this when the user says something like 'menu me iska price 50 kar do'.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        itemName: { type: "STRING", description: "The name of the menu item to update" },
                        newPrice: { type: "NUMBER", description: "The new price for the item, if requested to change." },
                        newName: { type: "STRING", description: "The new name for the item, if requested to change." }
                      },
                      required: ["itemName"],
                    },
                  },
                  {
                    name: "navigateToScreen",
                    description: "Navigate to a specific screen in the POS application (like billing, menu, sales history, etc)",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        screenName: {
                          type: "STRING",
                          description: "The ID of the screen to navigate to: 'billing', 'menu', 'history', 'sales', 'settings', 'table_orders'",
                        },
                      },
                      required: ["screenName"],
                    },
                  }
                ],
              }
            ]
          }
        });
        
        reply = geminiResponse.text || "Sorry, I couldn't process that with Gemini.";
        const functionCalls = geminiResponse.functionCalls;
        
        return res.json({ 
          reply,
          action: functionCalls && functionCalls.length > 0 ? {
            name: functionCalls[0].name,
            args: functionCalls[0].args
          } : null
        });
      }

      res.json({ reply, action: null });
    } catch (error: any) {
      console.error("AI API Error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat request" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Server running on port ${PORT}`);
  });
}

startServer();
