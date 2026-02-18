import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { amount, pix_key } = await req.json();

    if (!amount || amount < 20) {
      return new Response(JSON.stringify({ error: "Valor mínimo de saque é R$ 20,00" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pix_key) {
      return new Response(JSON.stringify({ error: "Chave PIX é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("balance, pix_key")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.balance < amount) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save pix_key to profile if different
    if (profile.pix_key !== pix_key) {
      await supabase
        .from("profiles")
        .update({ pix_key })
        .eq("user_id", userId);
    }

    // BS Pay auth
    const clientId = Deno.env.get("BSPAY_CLIENT_ID")!;
    const clientSecret = Deno.env.get("BSPAY_CLIENT_SECRET")!;

    const tokenRes = await fetch("https://api.bfrpagamentos.com.br/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      console.error("BS Pay token error:", await tokenRes.text());
      return new Response(JSON.stringify({ error: "Erro ao autenticar com gateway" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Request PIX transfer
    const transferRes = await fetch("https://api.bfrpagamentos.com.br/api/pix/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: amount.toFixed(2),
        pix_key: pix_key,
        description: `Saque PIX - R$ ${amount.toFixed(2)}`,
      }),
    });

    if (!transferRes.ok) {
      const errText = await transferRes.text();
      console.error("BS Pay transfer error:", errText);
      return new Response(JSON.stringify({ error: "Erro ao processar saque" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transferData = await transferRes.json();

    // Record withdrawal transaction
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount,
      status: "pending",
      gateway_ref: transferData.transaction_id || transferData.id || "",
    });

    if (txError) {
      console.error("Transaction insert error:", txError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Saque solicitado com sucesso",
        transaction_id: transferData.transaction_id || transferData.id || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-withdraw error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
