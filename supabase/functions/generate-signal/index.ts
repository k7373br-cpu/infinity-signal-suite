import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instrument, timeframe, feedbackHistory, lang } = await req.json();

    const BOTHUB_API_KEY = Deno.env.get('BOTHUB_API_KEY');
    if (!BOTHUB_API_KEY) {
      throw new Error('BOTHUB_API_KEY is not configured');
    }

    // Build feedback context for AI
    let feedbackContext = "";
    if (feedbackHistory && feedbackHistory.length > 0) {
      const positiveCount = feedbackHistory.filter((f: string) => f === '+').length;
      const totalCount = feedbackHistory.length;
      const accuracy = Math.round((positiveCount / totalCount) * 100);

      if (lang === "ru") {
        feedbackContext = `\n\nИСТОРИЯ ТОЧНОСТИ: ${positiveCount} правильных из ${totalCount} сигналов (${accuracy}% точность).`;
      } else {
        feedbackContext = `\n\nACCURACY HISTORY: ${positiveCount} correct out of ${totalCount} signals (${accuracy}% accuracy).`;
      }
    }

    const prompt = lang === "ru"
      ? `Ты профессиональный трейдер. Проанализируй ${instrument} на таймфрейме ${timeframe}.${feedbackContext}

Дай свой анализ и торговую рекомендацию.

ВАЖНО: Ответь СТРОГО в формате:
СИГНАЛ: BUY или SELL
ОБОСНОВАНИЕ: краткое объяснение на русском`
      : `You are a professional trader. Analyze ${instrument} on ${timeframe} timeframe.${feedbackContext}

Give your analysis and trading recommendation.

IMPORTANT: Reply STRICTLY in format:
SIGNAL: BUY or SELL
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
            content: 'You are an expert trading analyst. Always provide confident trading signals. Follow the format exactly.'
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

    // Calculate probability based on feedback history (50–92)
    let probability = 70;
    if (feedbackHistory && feedbackHistory.length > 0) {
      const positiveCount = feedbackHistory.filter((f: string) => f === '+').length;
      const totalCount = feedbackHistory.length;

      const accuracy = positiveCount / totalCount; // 0–1
      probability = Math.round(50 + accuracy * 42);
      probability = Math.max(50, Math.min(92, probability));
    }

    // Parse reason
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
