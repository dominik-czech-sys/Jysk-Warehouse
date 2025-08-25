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
    // 1. Získání dat z požadavku
    const { email, password, username, first_name, last_name, role, store_id } = await req.json();
    if (!email || !password || !username || !first_name || !last_name || !role) {
      throw new Error("Chybí povinné údaje o uživateli.");
    }

    // 2. Vytvoření klienta pro ověření volajícího uživatele
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") } } }
    );

    // 3. Ověření, zda je volající uživatel administrátor
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Neautorizovaný přístup.");

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      throw new Error("Přístup odepřen: Pouze pro administrátory.");
    }

    // 4. Vytvoření administrátorského klienta pro vytvoření nového uživatele
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: newUserData, error: creationError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatické potvrzení emailu
      user_metadata: { username, first_name, last_name, role, store_id },
    });

    if (creationError) throw creationError;

    // 5. Automatické schválení nově vytvořeného uživatele
    if (newUserData.user) {
      await supabaseAdmin
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", newUserData.user.id);
    }

    return new Response(JSON.stringify({ message: "Uživatel úspěšně vytvořen.", user: newUserData.user }), {
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