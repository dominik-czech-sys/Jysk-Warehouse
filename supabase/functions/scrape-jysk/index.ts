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
    .map(link => (link as Element).getAttribute('href')) // OPRAVA: Přidána typová kontrola
    .filter(href => href && !href.startsWith('/vsechny-produkty'))
    .map(href => `${BASE_URL}${href}`);
  
  console.log(`Found ${urls.length} category URLs.`);
  return [...new Set(urls)]; // Odstranění duplicit
}

// Krok 2: Získání URL adres všech produktů z dané kategorie (včetně stránkování)
async function getProductUrlsFromCategory(categoryUrl: string): Promise<string[]> {
  let page = 1;
  const productUrls = new Set<string>();
  console.log(`Scraping category: ${categoryUrl}`);

  while (true) {
    const url = `${categoryUrl}?page=${page}`;
    const response = await fetch(url);
    if (!response.ok) break;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) break;

    const productLinks = doc.querySelectorAll('a.product-card__link');
    if (productLinks.length === 0) {
      console.log(`No more products found on page ${page}. Moving to next category.`);
      break; // Konec stránkování
    }

    productLinks.forEach(link => {
      const href = (link as Element).getAttribute('href'); // OPRAVA: Přidána typová kontrola
      if (href) productUrls.add(`${BASE_URL}${href}`);
    });

    console.log(`Found ${productLinks.length} products on page ${page}. Total for category: ${productUrls.size}`);
    page++;
    if (page > 100) { // Pojistka proti nekonečné smyčce
        console.log("Page limit reached for category, stopping.");
        break;
    }
  }
  return Array.from(productUrls);
}

// Krok 3: Extrakce detailů z stránky jednoho produktu
async function getProductDetails(productUrl: string): Promise<any | null> {
  try {
    const response = await fetch(productUrl);
    if (!response.ok) return null;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) return null;

    const name = doc.querySelector('h1[data-testid="pdp-title"]')?.textContent.trim();
    const articleNoRaw = doc.querySelector('span[data-testid="pdp-article-number"]')?.textContent.trim();

    if (name && articleNoRaw) {
      const articleNo = articleNoRaw.replace("Art. č.:", "").trim();
      return {
        id: articleNo,
        name: name,
        category: "Neznámá",
        status: "21",
        min_quantity: 0,
      };
    }
    return null;
  } catch (e) {
    console.error(`Error fetching details for ${productUrl}:`, e.message);
    return null;
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
      const productUrls = await getProductUrlsFromCategory(catUrl);
      const productPromises = productUrls.map(prodUrl => getProductDetails(prodUrl));
      const productsFromCategory = (await Promise.all(productPromises)).filter(p => p !== null);
      allProducts.push(...productsFromCategory);
      console.log(`Finished category ${catUrl}. Total products found so far: ${allProducts.length}`);
    }
    
    // Odstranění duplicitních produktů podle ID
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