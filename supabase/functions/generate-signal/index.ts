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
    const { instrument, timeframe, lang } = await req.json();

    const BOTHUB_API_KEY = Deno.env.get('BOTHUB_API_KEY');
    if (!BOTHUB_API_KEY) {
      throw new Error('BOTHUB_API_KEY is not configured');
    }

    // Simple prompt - AI only decides BUY or SELL
    const prompt = lang === "ru"
      ? `Ты профессиональный трейдер. Проанализируй ${instrument} на таймфрейме ${timeframe}.
Ответь одним словом: BUY или SELL`
      : `You are a professional trader. Analyze ${instrument} on ${timeframe} timeframe.
Reply with one word: BUY or SELL`;

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
            content: 'You are an expert trading analyst. Reply with exactly one word: BUY or SELL. Nothing else.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.5
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

    // Parse direction from AI
    const contentUpper = content.toUpperCase();
    let direction = 'BUY';
    if (contentUpper.includes('SELL')) {
      direction = 'SELL';
    }

    // Random probability 50–92 (not from AI, not affected by feedback)
    const probability = Math.floor(Math.random() * (92 - 50 + 1)) + 50;

    // Simple reason based on direction
    const reason = lang === "ru" 
      ? (direction === 'BUY' ? "Технический анализ указывает на рост" : "Технический анализ указывает на снижение")
      : (direction === 'BUY' ? "Technical analysis indicates upward movement" : "Technical analysis indicates downward movement");

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
