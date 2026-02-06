import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.88.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PageData {
  id: string;
  page_number: number;
  image_url: string;
  thumbnail_url: string | null;
}

interface OCRResult {
  extracted_text: string;
  topics: string[];
  keywords: string[];
  chapter_title: string | null;
  summary: string;
}

async function analyzePageWithAI(imageUrl: string, apiKey: string): Promise<OCRResult> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an expert OCR and content analysis assistant. Analyze textbook/book pages and extract structured information. Always respond with valid JSON only, no markdown.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this textbook/book page image and extract:
1. All visible text (OCR) - preserve key content, clean up formatting
2. Topics/Lessons mentioned (e.g., "Photosynthesis", "Chapter 5: Fractions", "Multiplication Tables")
3. Keywords for search (10-20 important searchable terms)
4. Chapter/Section title if visible
5. A brief 1-2 sentence summary of the page content

Return ONLY valid JSON in this exact format:
{
  "extracted_text": "full text content from the page",
  "topics": ["Topic 1", "Topic 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "chapter_title": "Chapter title or null",
  "summary": "Brief summary of page content"
}`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("AI Gateway error:", response.status, error);
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  // Parse JSON from response
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    return {
      extracted_text: parsed.extracted_text || "",
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      chapter_title: parsed.chapter_title || null,
      summary: parsed.summary || "",
    };
  } catch (e) {
    console.error("Failed to parse AI response:", e, content);
    // Return minimal result if parsing fails
    return {
      extracted_text: content,
      topics: [],
      keywords: [],
      chapter_title: null,
      summary: "Unable to parse page content",
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { book_id, start_page, end_page } = await req.json();

    if (!book_id) {
      return new Response(
        JSON.stringify({ error: "book_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting OCR indexing for book: ${book_id}`);

    // Update book status to indexing
    await supabase
      .from('books')
      .update({ index_status: 'indexing' })
      .eq('id', book_id);

    // Fetch book pages
    let query = supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', book_id)
      .order('page_number');

    if (start_page) query = query.gte('page_number', start_page);
    if (end_page) query = query.lte('page_number', end_page);

    const { data: pages, error: pagesError } = await query;

    if (pagesError || !pages) {
      throw new Error(`Failed to fetch pages: ${pagesError?.message}`);
    }

    console.log(`Found ${pages.length} pages to process`);

    // Use waitUntil for background processing
    const backgroundTask = async () => {
      let successCount = 0;
      let errorCount = 0;

      for (const page of pages as PageData[]) {
        try {
          console.log(`Processing page ${page.page_number}...`);

          // Check if already indexed
          const { data: existing } = await supabase
            .from('book_page_index')
            .select('id')
            .eq('page_id', page.id)
            .eq('index_status', 'completed')
            .maybeSingle();

          if (existing) {
            console.log(`Page ${page.page_number} already indexed, skipping`);
            successCount++;
            continue;
          }

          // Update or create index entry to processing
          await supabase
            .from('book_page_index')
            .upsert({
              book_id,
              page_id: page.id,
              page_number: page.page_number,
              index_status: 'processing',
            }, { onConflict: 'book_id,page_id' });

          // Analyze page with AI
          const imageUrl = page.thumbnail_url || page.image_url;
          const result = await analyzePageWithAI(imageUrl, LOVABLE_API_KEY);

          // Save results
          await supabase
            .from('book_page_index')
            .upsert({
              book_id,
              page_id: page.id,
              page_number: page.page_number,
              extracted_text: result.extracted_text,
              topics: result.topics,
              keywords: result.keywords,
              chapter_title: result.chapter_title,
              summary: result.summary,
              index_status: 'completed',
              indexed_at: new Date().toISOString(),
            }, { onConflict: 'book_id,page_id' });

          successCount++;
          console.log(`Page ${page.page_number} indexed successfully`);

          // Rate limit protection: wait between requests
          await new Promise(resolve => setTimeout(resolve, 800));

        } catch (error) {
          console.error(`Error processing page ${page.page_number}:`, error);
          errorCount++;

          // Mark page as error
          await supabase
            .from('book_page_index')
            .upsert({
              book_id,
              page_id: page.id,
              page_number: page.page_number,
              index_status: 'error',
            }, { onConflict: 'book_id,page_id' });

          // If rate limited, wait longer
          if (error instanceof Error && error.message.includes('429')) {
            console.log('Rate limited, waiting 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      // Update book status based on results
      const finalStatus = errorCount === pages.length ? 'error' : 'indexed';
      await supabase
        .from('books')
        .update({ index_status: finalStatus })
        .eq('id', book_id);

      console.log(`Indexing complete. Success: ${successCount}, Errors: ${errorCount}`);
    };

    // Start background processing
    EdgeRuntime.waitUntil(backgroundTask());

    return new Response(
      JSON.stringify({ 
        message: "OCR indexing started",
        pages_to_process: pages.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OCR indexing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
