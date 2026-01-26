const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map our pair formats to Finnhub symbols
function mapToFinnhubSymbol(pair: string, assetType: 'forex' | 'crypto' | 'metals'): string {
  if (assetType === 'forex') {
    // EUR/USD -> OANDA:EUR_USD
    return `OANDA:${pair.replace('/', '_')}`;
  }
  
  if (assetType === 'crypto') {
    // BTC/USDT -> BINANCE:BTCUSDT
    return `BINANCE:${pair.replace('/', '')}`;
  }
  
  if (assetType === 'metals') {
    // GOLD -> OANDA:XAU_USD, SILVER -> OANDA:XAG_USD
    const metalMap: Record<string, string> = {
      'GOLD': 'OANDA:XAU_USD',
      'SILVER': 'OANDA:XAG_USD',
      'PLATINUM': 'OANDA:XPT_USD',
      'PALLADIUM': 'OANDA:XPD_USD'
    };
    return metalMap[pair] || pair;
  }
  
  return pair;
}

function getAssetType(pair: string): 'forex' | 'crypto' | 'metals' {
  if (['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM'].includes(pair)) {
    return 'metals';
  }
  if (pair.includes('USDT')) {
    return 'crypto';
  }
  return 'forex';
}

interface QuoteResult {
  pair: string;
  price: number;
  change: number;
  error?: string;
}

async function fetchQuote(pair: string, apiKey: string): Promise<QuoteResult> {
  const assetType = getAssetType(pair);
  const symbol = mapToFinnhubSymbol(pair, assetType);
  
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch quote for ${pair}: ${response.status}`);
      return { pair, price: 0, change: 0, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    // Finnhub returns: c (current), d (change), dp (percent change)
    if (data.c && data.c > 0) {
      return {
        pair,
        price: data.c,
        change: data.dp || 0
      };
    }
    
    // If no data, return error
    return { pair, price: 0, change: 0, error: 'No data available' };
  } catch (error) {
    console.error(`Error fetching quote for ${pair}:`, error);
    return { pair, price: 0, change: 0, error: String(error) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pairs } = await req.json();
    
    if (!pairs || !Array.isArray(pairs)) {
      return new Response(
        JSON.stringify({ error: 'pairs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Finnhub API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching quotes for ${pairs.length} pairs`);
    
    // Fetch quotes in parallel (but limit to avoid rate limits)
    const batchSize = 10;
    const results: QuoteResult[] = [];
    
    for (let i = 0; i < pairs.length; i += batchSize) {
      const batch = pairs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(pair => fetchQuote(pair, apiKey))
      );
      results.push(...batchResults);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < pairs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Convert to record format
    const quotes: Record<string, { price: number; change: number }> = {};
    for (const result of results) {
      if (!result.error && result.price > 0) {
        quotes[result.pair] = {
          price: result.price,
          change: result.change
        };
      }
    }

    console.log(`Successfully fetched ${Object.keys(quotes).length} quotes`);
    
    return new Response(
      JSON.stringify({ quotes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in finnhub-quotes function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
