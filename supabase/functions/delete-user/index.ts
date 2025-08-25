// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Získání ID uživatele z požadavku
    const { user_id } = await req.json();
    if (!user_id) throw new Error("Chybí ID uživatele.");

    // 2. Ověření, zda je volající uživatel administrátor
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Neautorizovaný přístup.");
    if (user.id === user_id) throw new Error("Nelze smazat sám sebe.");

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || !profile || profile.role !== "admin") {
      throw new Error("Přístup odepřen: Pouze pro administrátory.");
    }

    // 3. Vytvoření administrátorského klienta a smazání uživatele
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Uživatel úspěšně smazán.", data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});