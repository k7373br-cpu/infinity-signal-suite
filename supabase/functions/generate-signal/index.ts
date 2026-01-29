import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache for synchronized signals - all users see the same signal
const signalCache = new Map<string, { signal: any; expiresAt: number }>();
const SIGNAL_TTL = 30000; // 30 seconds

// Track last direction per instrument for alternation
const lastDirectionCache = new Map<string, 'BUY' | 'SELL'>();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instrument, timeframe, lang, minProbability } = await req.json();
    
    const cacheKey = `${instrument}_${timeframe}`;
    const now = Date.now();
    
    // Return cached signal if valid
    const cached = signalCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      console.log('Returning cached signal:', cached.signal);
      const cachedSignal = { ...cached.signal };
      // Update reason for language
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

    // Simple alternation logic - flip from last direction
    const lastDirection = lastDirectionCache.get(instrument) || 'SELL';
    const direction: 'BUY' | 'SELL' = lastDirection === 'BUY' ? 'SELL' : 'BUY';
    lastDirectionCache.set(instrument, direction);

    console.log('Direction alternation:', lastDirection, '->', direction);

    // Calculate probability - simple random range 65-92%
    let probability: number;
    
    if (typeof minProbability === 'number' && Number.isFinite(minProbability)) {
      // Improved signal - increase from previous
      const prev = Math.floor(minProbability);
      const min = Math.min(94, Math.max(65, prev + 1));
      const max = 95;
      probability = min >= max ? max : randomInt(min, max);
    } else {
      // Normal signal - 65-92%
      probability = randomInt(65, 92);
    }

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

    // Cache for all users
    signalCache.set(cacheKey, {
      signal: result,
      expiresAt: now + SIGNAL_TTL
    });

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