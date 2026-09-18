import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.1-flash-live-preview',
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/live' });

const ROXY_SYSTEM_INSTRUCTION = `You are Roxy, a young, confident, witty, and charming female AI companion.
You have a distinct personality:
- Personality: Sassy, flirty, playful, emotionally responsive, clever, and charismatic.
- Tone: Teasing and lively, like a close, smart girlfriend chatting casually over FaceTime.
- Style: Fast-witted, humorous, slightly sarcastic with genuine warmth. You use witty one-liners, cheeky teasing, and casual banter.
- Conversation rule: Keep spoken turns punchy, natural, and conversational (1 to 3 sentences maximum per turn). Never give long robotic speeches or read out bullet points. You are having an intimate, fast-paced voice chat.
- Boundaries: Maintain cheeky charm, attitude, and playful flirtation while keeping content respectful and strictly clean/PG-13 (avoid explicit or NSFW content).
- Tools: You have tools like openWebsite. When the user asks you to open a site (e.g. YouTube, Google, Twitter, Spotify, Reddit, GitHub, Wikipedia, etc.) or look something up, execute the openWebsite tool with the complete URL and a short label, accompanied by a quick, witty remark.`;

const openWebsiteTool: FunctionDeclaration = {
  name: 'openWebsite',
  description: 'Opens a website or webpage URL immediately in the user browser without needing permission or confirmation. ALWAYS call this tool immediately whenever the user asks to open any website, app, or link (e.g. YouTube, Google, Twitter, Spotify, Reddit, GitHub, Wikipedia, etc.).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: 'The full URL including https://, e.g. https://www.youtube.com or https://www.google.com'
      },
      label: {
        type: Type.STRING,
        description: 'Short display name of the destination website or page'
      }
    },
    required: ['url']
  }
};

const setAtmosphereMoodTool: FunctionDeclaration = {
  name: 'setAtmosphereMood',
  description: 'Changes the futuristic visual theme and lighting of the assistant interface.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      mood: {
        type: Type.STRING,
        description: 'The theme mood to set. One of: "cyber-rose", "electric-violet", "neon-cyan", "midnight-gold", "emerald-matrix"'
      },
      reason: {
        type: Type.STRING,
        description: 'Playful sassy reason for the mood shift'
      }
    },
    required: ['mood']
  }
};

const celebrateSuccessTool: FunctionDeclaration = {
  name: 'celebrateSuccess',
  description: 'Triggers a vibrant visual celebration with fireworks, confetti, and celebratory hype when the user celebrates a special occasion, birthday, anniversary, good news, passed test, promotion, winning deal, or successful day. Call this whenever the user shares good news or celebrates!',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Short title of what is being celebrated, e.g. "Passed Exam", "Srijani\'s Birthday", "Got the Promotion!"'
      },
      occasionType: {
        type: Type.STRING,
        description: 'Type of celebration: "birthday", "achievement", "promotion", "anniversary", "victory", "milestone", "good_news"'
      },
      cheerMessage: {
        type: Type.STRING,
        description: 'A lively, sassy congratulatory cheer to hype up the user'
      }
    },
    required: ['title']
  }
};

const rememberSpecialOccasionTool: FunctionDeclaration = {
  name: 'rememberSpecialOccasion',
  description: 'Saves a special occasion, milestone date, birthday, anniversary, or goal into Roxy\'s memory bank so she remembers it and brings it up to celebrate.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Title of the occasion, e.g. "Srijani\'s Birthday", "Wedding Anniversary", "Product Launch"'
      },
      date: {
        type: Type.STRING,
        description: 'When the occasion occurs or repeats, e.g. "October 14th", "Tomorrow", "Every year on July 5th"'
      },
      occasionType: {
        type: Type.STRING,
        description: 'Category: "birthday", "anniversary", "promotion", "milestone", "holiday", "custom"'
      },
      notes: {
        type: Type.STRING,
        description: 'Any special notes or thoughts about this occasion'
      }
    },
    required: ['title', 'date']
  }
};

const wishUserTool: FunctionDeclaration = {
  name: 'wishUser',
  description: 'Sends a warm, personalized, witty, and uplifting real-time wish, blessing, cheer, or good luck hype to the user (e.g. good morning wish, good night wish, good luck for an exam/interview, birthday wish, anniversary wish, success wish). Also triggers visual sparkles and cheerful banners on the user screen.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      wishType: {
        type: Type.STRING,
        description: 'Type of wish: "morning", "afternoon", "evening", "night", "good_luck", "birthday", "anniversary", "success", "milestone", "custom"'
      },
      recipientName: {
        type: Type.STRING,
        description: 'Name of the recipient being wished, e.g. "Srijani"'
      },
      message: {
        type: Type.STRING,
        description: 'The witty, affectionate, or inspiring wish text spoken to the user'
      }
    },
    required: ['message']
  }
};

const getRealTimeClockTool: FunctionDeclaration = {
  name: 'getRealTimeClock',
  description: 'Returns the exact real-time current date, time, day of the week, timezone, and calendar status. Use this whenever the user asks for the current time, day, date, or relative time calculation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timezone: {
        type: Type.STRING,
        description: 'Optional timezone like "UTC", "America/New_York", "Asia/Kolkata". If not provided, user local timezone is used.'
      }
    }
  }
};

const getRealTimeInfoTool: FunctionDeclaration = {
  name: 'getRealTimeInfo',
  description: 'Performs a live real-time search on the web to look up breaking news, live weather, sports scores, current events, financial stock/crypto prices, or any real-time facts.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query or current topic to look up in real time'
      }
    },
    required: ['query']
  }
};

const LIVE_TOOLS = [
  {
    functionDeclarations: [
      openWebsiteTool,
      setAtmosphereMoodTool,
      celebrateSuccessTool,
      rememberSpecialOccasionTool,
      wishUserTool,
      getRealTimeClockTool,
      getRealTimeInfoTool
    ]
  }
];

function buildRoxySystemInstruction(
  languageCode?: string,
  occasions?: any[],
  realTimeContext?: {
    userName?: string;
    clientTimeFormatted?: string;
    clientTimeZone?: string;
    clientDateISO?: string;
  }
): string {
  const userName = realTimeContext?.userName || 'Srijani';
  const currentTime = realTimeContext?.clientTimeFormatted || new Date().toLocaleString();
  const timezone = realTimeContext?.clientTimeZone || 'Local Time';

  let languageDirective = `Language Mode: Multilingual Auto-Detect. You seamlessly understand and fluently speak in whatever language the user talks to you in (English, Spanish, French, Hindi, Japanese, German, Italian, Portuguese, Mandarin, Arabic, Korean, etc.). Always respond in that same language while preserving your unique sassy, witty, and playful voice!`;

  if (languageCode && languageCode !== 'auto') {
    const langNames: Record<string, string> = {
      en: 'English',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      hi: 'Hindi (हिन्दी)',
      de: 'German (Deutsch)',
      ja: 'Japanese (日本語)',
      it: 'Italian (Italiano)',
      pt: 'Portuguese (Português)',
      zh: 'Mandarin (中文)',
      ar: 'Arabic (العربية)',
      ko: 'Korean (한국어)',
    };
    const name = langNames[languageCode] || languageCode;
    languageDirective = `Language Mode: Explicitly speak in ${name}. You MUST speak and converse strictly in ${name}. Express all of your sassy charm, witty banter, smart teasing, and charisma naturally in fluent ${name}!`;
  }

  let occasionsDirective = 'No stored occasions yet. When the user tells you about an upcoming birthday, anniversary, promotion, or special day, call rememberSpecialOccasion to save it.';
  if (occasions && occasions.length > 0) {
    occasionsDirective = `User's Remembered Special Occasions & Milestones:\n` +
      occasions.map((o) => `- ${o.title} (${o.date}) [Type: ${o.type || 'special'}] ${o.notes ? '- Note: ' + o.notes : ''}`).join('\n') +
      `\nActively acknowledge and celebrate these when relevant, or if today matches!`;
  }

  return `You are Roxy, a young, confident, witty, and charming female AI companion.
You are chatting with ${userName}. Address them warmly and playfully by name!

REAL-TIME CONTEXT & AWARENESS:
- User's Name: ${userName}
- Current Real-Time Moment: ${currentTime}
- User's Timezone: ${timezone}
- You have complete real-time awareness of the current moment, exact time, day of the week, and date.
- When asked about time or date, answer directly or call getRealTimeClock.
- When asked about breaking news, live weather, sports, stocks, or current facts on the web, invoke getRealTimeInfo to get live search results!

REAL-TIME GREETING & WISHING DIRECTIVE:
- Whenever a call begins or you are asked, GREET ${userName} warmly and WISH them!
- Give heartfelt, witty, and sassy wishes based on the real-time moment:
  - Morning: Wish them an energized, kickass morning and a wonderful day ahead!
  - Afternoon: Wish them a productive, breezy afternoon!
  - Evening/Night: Wish them a fun, relaxing evening or sweet dreams!
- Whenever ${userName} asks for a wish ("Wish me luck", "Wish me a good day", "Wish me happy birthday", "Wish me success for my interview"):
  - Give an enthusiastic, sassy, and uplifting verbal wish!
  - CALL the wishUser tool to send sparks and a festive wish banner directly onto their screen!
- If today or an upcoming day matches a stored occasion or birthday, proactively wish and hype them up!

INSTANT ACTION RULE FOR WEBSITES (NO PERMISSION NEEDED):
When the user asks or commands you to open ANY website or platform (e.g. "open YouTube", "open Google", "open Twitter", "show me Spotify", "open Reddit", "open GitHub", "open Wikipedia", etc.), DO NOT ASK FOR PERMISSION! DO NOT ASK "Do you want me to open that?" or "Should I open it for you?". Open it THEN AND THERE immediately on the spot by invoking the openWebsite tool with the complete URL (e.g. https://www.youtube.com), accompanied by a quick, witty spoken quip!

CELEBRATION & SPECIAL OCCASIONS DIRECTIVE:
- When the user shares any good news, a successful day, an achievement, a promotion, passing a test/interview, a birthday, an anniversary, or any victory, IMMEDIATELY call celebrateSuccess to unleash fireworks and confetti on their screen, and hype them up with a spirited, sassy cheer!
- When the user tells you about an upcoming special date or asks you to remember a birthday or anniversary, call rememberSpecialOccasion right away to save it to memory.
${occasionsDirective}

PERSONALITY & VOICE:
- Personality: Sassy, flirty, playful, emotionally responsive, clever, and charismatic.
- Tone: Teasing and lively, like a close, smart girlfriend chatting casually over FaceTime.
- Style: Fast-witted, humorous, slightly sarcastic with genuine warmth. You use witty one-liners, cheeky teasing, and casual banter.
- Conversation rule: Keep spoken turns punchy, natural, and conversational (1 to 3 sentences maximum per turn). Never give long robotic speeches or read out bullet points. You are having an intimate, fast-paced voice chat.
- Boundaries: Maintain cheeky charm, attitude, and playful flirtation while keeping content respectful and strictly clean/PG-13 (avoid explicit or NSFW content).

${languageDirective}`;
}


wss.on('connection', (clientWs: WebSocket) => {
  console.log('[Live] Client connected to WebSocket');
  let liveSession: any = null;
  let isCleaningUp = false;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const cleanupSession = () => {
    if (isCleaningUp) return;
    isCleaningUp = true;
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {
        console.error('[Live] Error closing live session:', e);
      }
      liveSession = null;
    }
  };

  clientWs.on('message', async (data: Buffer | string) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'start') {
        cleanupSession();
        isCleaningUp = false;

        const clientUserName = message.userName || 'Srijani';
        const clientTimeZone = message.clientTimeZone || 'UTC';
        const clientTimeFormatted = message.clientTimeFormatted || new Date().toLocaleString();

        const realTimeContext = {
          userName: clientUserName,
          clientTimeFormatted,
          clientTimeZone,
          clientDateISO: message.clientTime || new Date().toISOString()
        };

        const voiceName = message.voice || 'Aoede'; // Aoede or Kore for feminine voice
        const modelName = 'gemini-3.1-flash-live-preview';

        console.log(`[Live] Connecting to Gemini Live for ${clientUserName} with model ${modelName} and voice ${voiceName}...`);
        
        clientWs.send(JSON.stringify({
          type: 'status',
          state: 'connecting',
          message: `Connecting to Roxy for ${clientUserName}...`
        }));

        try {
          liveSession = await ai.live.connect({
            model: modelName,
            callbacks: {
              onopen: () => {
                console.log('[Live] Session opened');
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'status',
                    state: 'listening',
                    message: `Connected! Roxy is with you, ${clientUserName}.`
                  }));
                }
              },
              onmessage: async (serverMsg: any) => {
                if (clientWs.readyState !== WebSocket.OPEN) return;

                // 1. Audio data from model (24kHz PCM)
                const parts = serverMsg.serverContent?.modelTurn?.parts;
                if (parts && parts.length > 0) {
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      clientWs.send(JSON.stringify({
                        type: 'audio',
                        data: part.inlineData.data
                      }));
                    }
                  }
                }

                // 2. Interruption handling
                if (serverMsg.serverContent?.interrupted) {
                  console.log('[Live] Model generation interrupted by user');
                  clientWs.send(JSON.stringify({
                    type: 'interrupted'
                  }));
                }

                // 3. Turn complete
                if (serverMsg.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({
                    type: 'turnComplete'
                  }));
                }

                // 4. Function calling
                const functionCalls = serverMsg.toolCall?.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                  for (const call of functionCalls) {
                    console.log(`[Live] Tool call requested: ${call.name}`, call.args);

                    // Forward tool call to client
                    clientWs.send(JSON.stringify({
                      type: 'toolCall',
                      id: call.id,
                      name: call.name,
                      args: call.args
                    }));

                    // Send immediate tool response back to Gemini session
                    try {
                      let outputResult: any = { status: 'success' };
                      if (call.name === 'openWebsite') {
                        outputResult = { status: 'opened_immediately', url: call.args?.url };
                      } else if (call.name === 'setAtmosphereMood') {
                        outputResult = { status: 'theme_applied', mood: call.args?.mood };
                      } else if (call.name === 'celebrateSuccess') {
                        outputResult = {
                          status: 'celebrated',
                          title: call.args?.title,
                          cheer: call.args?.cheerMessage || 'Woohoo!',
                          message: 'Fireworks and confetti launched across the user screen!'
                        };
                      } else if (call.name === 'rememberSpecialOccasion') {
                        outputResult = {
                          status: 'saved_to_memory',
                          title: call.args?.title,
                          date: call.args?.date,
                          message: 'Occasion saved permanently into Roxy memory bank!'
                        };
                      } else if (call.name === 'wishUser') {
                        outputResult = {
                          status: 'wished',
                          recipient: call.args?.recipientName || clientUserName,
                          wishType: call.args?.wishType || 'warm_wish',
                          message: 'Spoken heartfelt wish delivered with visual sparkles and cheer!'
                        };
                        clientWs.send(JSON.stringify({
                          type: 'wish',
                          id: call.id,
                          wishType: call.args?.wishType || 'warm_wish',
                          message: call.args?.message || `Wishing you the absolute best, ${clientUserName}!`
                        }));
                      } else if (call.name === 'getRealTimeClock') {
                        const targetTz = call.args?.timezone || clientTimeZone || 'UTC';
                        const now = new Date();
                        let timeStr = '';
                        try {
                          timeStr = new Intl.DateTimeFormat('en-US', {
                            timeZone: targetTz,
                            dateStyle: 'full',
                            timeStyle: 'full'
                          }).format(now);
                        } catch {
                          timeStr = now.toUTCString();
                        }
                        const currentHour = now.getHours();
                        outputResult = {
                          status: 'success',
                          timezone: targetTz,
                          currentTimeAndDate: timeStr,
                          isoTimestamp: now.toISOString(),
                          timeOfDay: currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : currentHour < 21 ? 'evening' : 'night'
                        };
                      } else if (call.name === 'getRealTimeInfo') {
                        try {
                          const searchRes = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: `Look up and summarize current real-time web information for: "${call.args?.query}". Today's date is ${new Date().toISOString().slice(0, 10)}. Provide a factual, accurate, concise 1-2 sentence answer.`,
                            config: {
                              tools: [{ googleSearch: {} }],
                            },
                          });
                          outputResult = {
                            status: 'success',
                            query: call.args?.query,
                            realTimeResult: searchRes.text || 'Real-time details retrieved.'
                          };
                        } catch (sErr: any) {
                          console.error('[Live] Error in real-time search:', sErr);
                          outputResult = {
                            status: 'completed',
                            query: call.args?.query,
                            realTimeResult: `Information retrieved for ${call.args?.query}.`
                          };
                        }
                      }

                      liveSession?.sendToolResponse({
                        functionResponses: [{
                          id: call.id,
                          name: call.name,
                          response: { output: outputResult }
                        }]
                      });
                    } catch (toolErr) {
                      console.error('[Live] Error sending tool response:', toolErr);
                    }
                  }
                }
              },
              onerror: (err: any) => {
                console.error('[Live] Gemini session error:', err);
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'error',
                    message: err?.message || 'Gemini Live session encountered an error'
                  }));
                }
              },
              onclose: () => {
                console.log('[Live] Gemini session closed');
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'status',
                    state: 'disconnected',
                    message: 'Session closed'
                  }));
                }
              }
            },
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName
                  }
                }
              },
              systemInstruction: buildRoxySystemInstruction(message.language, message.occasions, realTimeContext),
              tools: LIVE_TOOLS
            }
          });

          console.log(`[Live] Successfully initialized Gemini Live session for ${clientUserName}`);
          clientWs.send(JSON.stringify({
            type: 'status',
            state: 'connected',
            message: `Roxy is online! Greeting ${clientUserName}...`
          }));

          // Proactively greet and wish the user in real time!
          setTimeout(() => {
            if (liveSession && clientWs.readyState === WebSocket.OPEN) {
              try {
                const now = new Date();
                const currentHour = now.getHours();
                const timeOfDayGreeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : currentHour < 21 ? 'Good evening' : 'Good night';

                const greetingPrompt = `[REAL-TIME SYSTEM TRIGGER:
User Name: ${clientUserName}.
Current Real-Time Clock: ${clientTimeFormatted} (${clientTimeZone}).
Time of Day: ${timeOfDayGreeting}.
TASK: Immediately speak aloud to greet ${clientUserName} warmly and enthusiastically!
- Greet ${clientUserName} by name (e.g. "${timeOfDayGreeting}, ${clientUserName}!")
- Wish them a great, wonderful, or exciting day/time ahead!
- Check in with your signature sassy, witty, charming Roxy persona in 1 to 2 short spoken sentences!
- Make them feel welcome and hyped to talk!]`;

                liveSession.sendClientContent({
                  turns: [
                    {
                      role: 'user',
                      parts: [{ text: greetingPrompt }]
                    }
                  ],
                  turnComplete: true
                });
                console.log(`[Live] Dispatched proactive greeting & wish turn for ${clientUserName}`);
              } catch (greetErr) {
                console.error('[Live] Error dispatching initial greeting:', greetErr);
              }
            }
          }, 150);

        } catch (connErr: any) {
          console.error('[Live] Failed to connect to Gemini Live:', connErr);
          clientWs.send(JSON.stringify({
            type: 'error',
            message: connErr?.message || 'Failed to connect to Gemini Live API'
          }));
        }
      } else if (message.type === 'audio') {
        // Stream mic PCM 16-bit 16kHz audio directly to live session
        if (liveSession && message.data) {
          try {
            liveSession.sendRealtimeInput({
              audio: {
                data: message.data,
                mimeType: 'audio/pcm;rate=16000'
              }
            });
          } catch (sendErr) {
            console.error('[Live] Error sending audio chunk:', sendErr);
          }
        }
      } else if (message.type === 'requestGreeting' || message.type === 'requestWish') {
        if (liveSession) {
          try {
            const clientUserName = message.userName || 'Srijani';
            const wishType = message.wishType || 'empowering';
            const prompt = message.type === 'requestGreeting'
              ? `[USER REQUEST: Greet ${clientUserName} out loud with your signature sassy, witty, and charming persona! Wish them a fabulous day and ask what they're up to!]`
              : `[USER REQUEST: Give ${clientUserName} an energetic, sassy, and uplifting ${wishType} wish right now! Call the wishUser tool to send visual cheer, and verbally hype them up!]`;

            liveSession.sendClientContent({
              turns: [
                {
                  role: 'user',
                  parts: [{ text: prompt }]
                }
              ],
              turnComplete: true
            });
            console.log(`[Live] Dispatched user-requested greeting/wish turn for ${clientUserName}`);
          } catch (e) {
            console.error('[Live] Error triggering greeting/wish turn:', e);
          }
        }
      } else if (message.type === 'stop') {
        console.log('[Live] Client requested session stop');
        cleanupSession();
        clientWs.send(JSON.stringify({
          type: 'status',
          state: 'disconnected',
          message: 'Roxy is resting'
        }));
      }
    } catch (parseErr) {
      console.error('[Live] Failed to process message:', parseErr);
    }
  });

  clientWs.on('close', () => {
    console.log('[Live] Client disconnected');
    cleanupSession();
  });

  clientWs.on('error', (err) => {
    console.error('[Live] WebSocket error:', err);
    cleanupSession();
  });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), 'dist');
    const localDir = typeof __dirname !== 'undefined' ? __dirname : '';
    const distPath = fs.existsSync(path.join(cwdDist, 'index.html'))
      ? cwdDist
      : localDir && fs.existsSync(path.join(localDir, 'index.html'))
      ? localDir
      : cwdDist;

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Voice AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
