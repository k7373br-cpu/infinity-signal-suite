import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instrument, timeframe, feedbackHistory, lang } = await req.json();
    
    const BOTHUB_API_KEY = Deno.env.get('BOTHUB_API_KEY');
    if (!BOTHUB_API_KEY) {
      throw new Error('BOTHUB_API_KEY is not configured');
    }

    // Calculate probability based on feedback history (0-92%)
    let probability = 46; // Base probability (middle of 0-92)
    let feedbackContext = "";
    
    if (feedbackHistory && feedbackHistory.length > 0) {
      const positiveCount = feedbackHistory.filter((f: string) => f === '+').length;
      const totalCount = feedbackHistory.length;
      
      // Calculate accuracy-based probability: (positive/total) * 92
      probability = Math.round((positiveCount / totalCount) * 92);
      // Ensure bounds 0-92
      probability = Math.max(0, Math.min(92, probability));
      
      if (lang === "ru") {
        feedbackContext = `\n\nИСТОРИЯ ПОЛЬЗОВАТЕЛЯ: Последние сигналы - ${positiveCount} ✅ правильных из ${totalCount}. Учти предпочтения пользователя в анализе.`;
      } else {
        feedbackContext = `\n\nUSER HISTORY: Recent signals - ${positiveCount} ✅ correct out of ${totalCount}. Consider user preferences in analysis.`;
      }
    }

    const prompt = lang === "ru" 
      ? `Ты профессиональный трейдер. Проанализируй ${instrument} на таймфрейме ${timeframe}.${feedbackContext}

Дай свой анализ и торговую рекомендацию. Будь уверен в своем анализе.

ВАЖНО: Ответь СТРОГО в формате:
СИГНАЛ: BUY или SELL
ВЕРОЯТНОСТЬ: число от 70 до 95
ОБОСНОВАНИЕ: краткое объяснение на русском`
      : `You are a professional trader. Analyze ${instrument} on ${timeframe} timeframe.${feedbackContext}

Give your analysis and trading recommendation. Be confident in your analysis.

IMPORTANT: Reply STRICTLY in format:
SIGNAL: BUY or SELL
PROBABILITY: number from 70 to 95
REASON: brief explanation`;

    console.log('Calling BotHub API for:', instrument, timeframe);

    const response = await fetch('https://bothub.chat/api/v2/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOTHUB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-pro-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert trading analyst. Always provide confident trading signals with probability estimates. Follow the format exactly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BotHub API error:', response.status, errorText);
      throw new Error(`BotHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', content);

    // Parse direction
    const contentUpper = content.toUpperCase();
    let direction = 'BUY';
    if (contentUpper.includes('SELL') || contentUpper.includes('ПРОДАВАЙ')) {
      direction = 'SELL';
    } else if (contentUpper.includes('BUY') || contentUpper.includes('ПОКУПАЙ')) {
      direction = 'BUY';
    }

    // Parse reason (probability is calculated from feedback, not AI)
    let reason = lang === "ru" ? "Анализ графических паттернов" : "Chart pattern analysis";
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('ОБОСНОВАНИЕ:') || line.includes('REASON:') || line.includes('ОБЪЯСНЕНИЕ:')) {
        const extracted = line.split(':').slice(1).join(':').trim();
        if (extracted) {
          reason = extracted;
        }
      }
    }

    const result = {
      direction,
      probability,
      reason,
      instrument,
      timeframe,
      id: crypto.randomUUID().substring(0, 9),
      timestamp: new Date().toISOString()
    };

    console.log('Generated signal:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating signal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
