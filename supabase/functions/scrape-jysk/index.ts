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
      const name = (element as Element).querySelector('[data-testid="product-card-name"]')?.textContent.trim();
      const articleNoRaw = (element as Element).querySelector('[data-testid="product-card-article-number"]')?.textContent.trim();

      if (name && articleNoRaw) {
        const articleNo = articleNoRaw.replace("Art. č.:", "").trim();
        products.push({
          id: articleNo,
          name: name,
          category: "Neznámá", // Kategorie není na kartě snadno dostupná
          status: "21",
          min_quantity: 0,
        });
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
    let allProducts = [];

    for (const catUrl of categoryUrls) {
      let page = 1;
      console.log(`Scraping category: ${catUrl}`);
      while (true) {
        const pageUrl = `${catUrl}?page=${page}`;
        const productsFromPage = await getProductsFromCategoryPage(pageUrl);

        if (productsFromPage.length === 0) {
          console.log(`No more products found on page ${page} for this category. Moving on.`);
          break; // Žádné další produkty, přechod na další kategorii
        }

        allProducts.push(...productsFromPage);
        console.log(`Found ${productsFromPage.length} products on page ${page}. Total products so far: ${allProducts.length}`);
        page++;

        if (page > 50) { // Pojistka proti nekonečným smyčkám
          console.log("Page limit reached for this category, moving on.");
          break;
        }
      }
    }
    
    // Odstranění duplicit na základě ID produktu
    const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());
    console.log(`Found ${uniqueProducts.length} unique products in total. Upserting to database...`);

    if (uniqueProducts.length > 0) {
      const { error } = await supabaseClient
        .from("global_articles")
        .upsert(uniqueProducts, { onConflict: "id" });

      if (error) throw error;
    }
    
    console.log("Upsert complete.");

    return new Response(JSON.stringify({ count: uniqueProducts.length }), {
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