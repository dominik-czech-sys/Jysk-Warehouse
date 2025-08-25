import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://jysk.cz";

// Krok 1: Získání URL adres všech hlavních kategorií
async function getCategoryUrls(): Promise<string[]> {
  console.log("Fetching category URLs...");
  const response = await fetch(`${BASE_URL}/vsechny-produkty`);
  if (!response.ok) throw new Error("Failed to fetch main product page");
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) throw new Error("Failed to parse main product page HTML");

  const categoryLinks = doc.querySelectorAll('a.list-item.link');
  const urls = Array.from(categoryLinks)
    .map(link => (link as Element).getAttribute('href'))
    .filter(href => href && !href.startsWith('/vsechny-produkty'))
    .map(href => `${BASE_URL}${href}`);
  
  console.log(`Found ${urls.length} category URLs.`);
  return [...new Set(urls)];
}

// Krok 2: Extrakce produktů z jedné stránky kategorie
async function getProductsFromCategoryPage(pageUrl: string): Promise<any[]> {
  try {
    const response = await fetch(pageUrl);
    if (!response.ok) {
      console.warn(`Could not fetch ${pageUrl}, status: ${response.status}`);
      return [];
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) return [];

    const productElements = doc.querySelectorAll('.product-card');
    const products = [];

    for (const element of productElements) {
      const name = (element as Element).querySelector('[data-testid="product-card-name"]')?.textContent?.trim();
      const articleNoRaw = (element as Element).querySelector('[data-testid="product-card-article-number"]')?.textContent?.trim();

      if (name && articleNoRaw) {
        const articleNo = articleNoRaw.replace("Art. č.:", "").trim();
        products.push({
          id: articleNo,
          name: name,
          category: "Neznámá",
          status: "21",
          min_quantity: 0,
        });
      } else {
        console.warn(`Skipping a product card on ${pageUrl} due to missing name or article number.`);
      }
    }
    return products;
  } catch (e) {
    console.error(`Error processing page ${pageUrl}:`, e.message);
    return [];
  }
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const categoryUrls = await getCategoryUrls();
    let totalUpsertedCount = 0;

    // Zpracování v dávkách - kategorie po kategorii
    for (const catUrl of categoryUrls) {
      let page = 1;
      const productsFromCategory = [];
      console.log(`Processing category: ${catUrl}`);
      
      while (true) {
        const pageUrl = `${catUrl}?page=${page}`;
        const productsFromPage = await getProductsFromCategoryPage(pageUrl);

        if (productsFromPage.length === 0) {
          break; 
        }

        productsFromCategory.push(...productsFromPage);
        page++;
        if (page > 50) break; // Bezpečnostní pojistka
      }
      
      // Zpracování a nahrání produktů pro tuto jednu kategorii
      const uniqueProducts = Array.from(new Map(productsFromCategory.map(item => [item.id, item])).values());
      
      if (uniqueProducts.length > 0) {
        console.log(`Upserting ${uniqueProducts.length} products for category ${catUrl}...`);
        const { error } = await supabaseClient
          .from("global_articles")
          .upsert(uniqueProducts, { onConflict: "id" });

        if (error) {
          console.error(`Error upserting products for ${catUrl}:`, error);
          // V případě chyby pokračujeme na další kategorii
        } else {
          totalUpsertedCount += uniqueProducts.length;
          console.log(`Successfully upserted products for ${catUrl}.`);
        }
      }
    }
    
    console.log(`Total unique products upserted: ${totalUpsertedCount}`);

    return new Response(JSON.stringify({ count: totalUpsertedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("CRITICAL ERROR in scrape function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});