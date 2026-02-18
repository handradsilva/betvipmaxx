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

    const { gateway_ref } = await req.json();
    if (!gateway_ref) {
      return new Response(JSON.stringify({ error: "gateway_ref é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check transaction belongs to user and is still pending
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("gateway_ref", gateway_ref)
      .eq("user_id", userId)
      .single();

    if (txError || !tx) {
      return new Response(JSON.stringify({ error: "Transação não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already completed
    if (tx.status === "completed") {
      return new Response(JSON.stringify({ status: "completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tx.status !== "pending") {
      return new Response(JSON.stringify({ status: tx.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate with BS Pay
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
      const errText = await tokenRes.text();
      console.error("BS Pay token error:", errText);
      return new Response(JSON.stringify({ error: "Erro ao autenticar com gateway" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Check payment status at BS Pay
    const statusRes = await fetch(`https://api.bfrpagamentos.com.br/api/pix/qrcode/${gateway_ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      console.error("BS Pay status check error:", errText);
      return new Response(JSON.stringify({ status: "pending" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusData = await statusRes.json();
    console.log("BS Pay status response:", JSON.stringify(statusData));

    // Check if paid - adapt field names to BS Pay API response
    const isPaid =
      statusData.status === "paid" ||
      statusData.status === "completed" ||
      statusData.status === "approved" ||
      statusData.paid === true;

    if (isPaid) {
      // Update transaction to completed - trigger will credit balance
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", tx.id)
        .eq("status", "pending");

      if (updateError) {
        console.error("Transaction update error:", updateError);
      }

      return new Response(JSON.stringify({ status: "completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "pending" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("check-payment-status error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
