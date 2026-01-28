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
    const { instrument, timeframe, lang, minProbability, lastDirection } = await req.json();

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

    // Parse direction from AI and INVERT it (show opposite of what AI says)
    const contentUpper = content.toUpperCase();
    let aiDirection = 'BUY';
    if (contentUpper.includes('SELL')) {
      aiDirection = 'SELL';
    }
    
    // INVERT the AI direction - if AI says BUY, we show SELL and vice versa
    let direction = aiDirection === 'BUY' ? 'SELL' : 'BUY';
    
    // If lastDirection is provided, make sure we don't repeat it
    if (lastDirection && direction === lastDirection) {
      direction = lastDirection === 'BUY' ? 'SELL' : 'BUY';
    }

    // Calculate probability - make it varied and different each time
    let probability: number;
    const lastProbability = minProbability || 0;
    
    if (minProbability && minProbability < 92) {
      // For improved signal: generate between current+3 and 95, but ensure variety
      const min = Math.min(minProbability + 3, 90);
      const max = 95;
      probability = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      // Generate random probability 55-92, weighted towards middle values
      const ranges = [
        { min: 55, max: 65, weight: 25 },
        { min: 66, max: 75, weight: 35 },
        { min: 76, max: 85, weight: 30 },
        { min: 86, max: 92, weight: 10 }
      ];
      
      const roll = Math.random() * 100;
      let cumulative = 0;
      let selectedRange = ranges[1]; // default
      
      for (const range of ranges) {
        cumulative += range.weight;
        if (roll < cumulative) {
          selectedRange = range;
          break;
        }
      }
      
      probability = Math.floor(Math.random() * (selectedRange.max - selectedRange.min + 1)) + selectedRange.min;
    }
    
    // Ensure probability is different from last one (at least ±3 difference)
    if (Math.abs(probability - lastProbability) < 3 && lastProbability > 0) {
      probability = lastProbability < 75 ? lastProbability + 5 + Math.floor(Math.random() * 8) : lastProbability - 5 - Math.floor(Math.random() * 8);
      probability = Math.max(55, Math.min(95, probability));
    }

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
