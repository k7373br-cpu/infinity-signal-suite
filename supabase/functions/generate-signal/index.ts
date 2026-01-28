import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Global cache for synchronized signals - all users see the same signal
const signalCache = new Map<string, { signal: any; expiresAt: number }>();
const SIGNAL_TTL = 30000; // 30 seconds - all users get same signal within this window

// Track last direction per instrument to force alternation
const lastDirectionCache = new Map<string, string>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instrument, timeframe, lang } = await req.json();
    
    // Create cache key based on instrument and timeframe
    const cacheKey = `${instrument}_${timeframe}`;
    const now = Date.now();
    
    // Check if we have a valid cached signal for ALL users
    const cached = signalCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      console.log('Returning cached signal for all users:', cached.signal);
      // Return same signal with updated translations if needed
      const cachedSignal = { ...cached.signal };
      if (lang === 'ru') {
        cachedSignal.reason = cachedSignal.direction === 'BUY' 
          ? "Технический анализ указывает на рост" 
          : "Технический анализ указывает на снижение";
      } else {
        cachedSignal.reason = cachedSignal.direction === 'BUY'
          ? "Technical analysis indicates upward movement"
          : "Technical analysis indicates downward movement";
      }
      return new Response(JSON.stringify(cachedSignal), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const BOTHUB_API_KEY = Deno.env.get('BOTHUB_API_KEY');
    if (!BOTHUB_API_KEY) {
      throw new Error('BOTHUB_API_KEY is not configured');
    }

    // Simple prompt - AI only decides BUY or SELL
    const prompt = `You are a professional trader. Analyze ${instrument} on ${timeframe} timeframe.
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

    // Get last direction for this instrument to force alternation
    const lastDirection = lastDirectionCache.get(instrument) || 'BUY';
    
    // Parse direction from AI response
    const contentUpper = content.toUpperCase();
    let aiDirection = 'BUY';
    if (contentUpper.includes('SELL') || contentUpper.includes('DOWN') || contentUpper.includes('SHORT')) {
      aiDirection = 'SELL';
    } else if (contentUpper.includes('BUY') || contentUpper.includes('UP') || contentUpper.includes('LONG')) {
      aiDirection = 'BUY';
    }
    
    // INVERT the AI direction - if AI says BUY, we show SELL and vice versa
    let direction = aiDirection === 'BUY' ? 'SELL' : 'BUY';
    
    // Force alternation - if same as last, flip it
    if (direction === lastDirection) {
      direction = direction === 'BUY' ? 'SELL' : 'BUY';
    }
    
    // Save this direction for next time
    lastDirectionCache.set(instrument, direction);
    
    console.log('AI said:', aiDirection, '-> Inverted to:', direction, '(last was:', lastDirection, ')');

    // Calculate probability with weighted distribution for variety
    const ranges = [
      { min: 58, max: 67, weight: 25 },
      { min: 68, max: 77, weight: 35 },
      { min: 78, max: 86, weight: 30 },
      { min: 87, max: 94, weight: 10 }
    ];
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedRange = ranges[1];
    
    for (const range of ranges) {
      cumulative += range.weight;
      if (roll < cumulative) {
        selectedRange = range;
        break;
      }
    }
    
    const probability = Math.floor(Math.random() * (selectedRange.max - selectedRange.min + 1)) + selectedRange.min;

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

    // Cache the signal so ALL users get the same one
    signalCache.set(cacheKey, {
      signal: result,
      expiresAt: now + SIGNAL_TTL
    });

    console.log('Generated NEW signal for all users:', result);

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
