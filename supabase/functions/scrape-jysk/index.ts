import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Funkce pro extrakci dat z jedné stránky
async function scrapePage(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch ${url}: ${response.statusText}`);
    return [];
  }
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) {
    console.error("Failed to parse HTML document.");
    return [];
  }

  const products = [];
  const productElements = doc.querySelectorAll(".product-compact");

  for (const element of productElements) {
    const name = element.querySelector(".product-compact__name")?.textContent.trim();
    const articleNoRaw = element.querySelector(".product-compact__articleno")?.textContent.trim();
    const category = element.querySelector(".product-compact__category")?.textContent.trim();

    if (name && articleNoRaw) {
      const articleNo = articleNoRaw.replace("Art. č.:", "").trim();
      products.push({
        id: articleNo,
        name: name,
        category: category || "Neznámá",
        status: "21", // Default status
        min_quantity: 0,
      });
    }
  }
  return products;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    let allProducts = [];
    const baseUrl = "https://jysk.cz/vsechny-produkty";
    let page = 1;
    let hasMore = true;

    console.log("Starting scrape...");

    while (hasMore) {
      const url = `${baseUrl}?page=${page}`;
      console.log(`Scraping page: ${url}`);
      const productsFromPage = await scrapePage(url);

      if (productsFromPage.length > 0) {
        allProducts.push(...productsFromPage);
        page++;
        // Zastavíme po 50 stránkách, abychom předešli nekonečné smyčce
        if (page > 50) {
            console.log("Reached page limit, stopping.");
            hasMore = false;
        }
      } else {
        console.log("No more products found, stopping.");
        hasMore = false;
      }
    }
    
    console.log(`Found ${allProducts.length} products in total. Upserting to database...`);

    if (allProducts.length > 0) {
      const { error } = await supabaseClient
        .from("global_articles")
        .upsert(allProducts, { onConflict: "id" });

      if (error) {
        throw error;
      }
    }
    
    console.log("Upsert complete.");

    return new Response(JSON.stringify({ count: allProducts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});