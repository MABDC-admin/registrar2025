import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PageDetectionRequest {
  imageUrl: string;
  pageIndex: number;
}

interface PageDetectionResult {
  pageIndex: number;
  detectedPageNumber: string | null;
  pageType: 'numbered' | 'cover' | 'blank' | 'unknown';
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, pageIndex } = await req.json() as PageDetectionRequest;
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing page at index ${pageIndex}: ${imageUrl.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a page number detection assistant. Analyze book page images to detect the printed page number. 
            
Your task:
1. Look for printed page numbers (usually at corners, header, or footer of the page)
2. Identify if this is a cover page (front cover, back cover, title page with book title/author)
3. Identify if this is a blank page (mostly white/empty)
4. For numbered pages, extract the exact page number shown

Respond with a JSON object only, no markdown:
{
  "detectedPageNumber": "1" or null if not found,
  "pageType": "numbered" | "cover" | "blank" | "unknown",
  "confidence": 0.0 to 1.0
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this book page image and detect the page number if present. Return the result as JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log(`AI response for page ${pageIndex}:`, content);

    // Parse the JSON response
    let result: PageDetectionResult = {
      pageIndex,
      detectedPageNumber: null,
      pageType: 'unknown',
      confidence: 0
    };

    try {
      // Extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      result = {
        pageIndex,
        detectedPageNumber: parsed.detectedPageNumber || null,
        pageType: parsed.pageType || 'unknown',
        confidence: parsed.confidence || 0
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return default result with unknown type
    }

    console.log(`Detection result for page ${pageIndex}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in detect-page-number:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
