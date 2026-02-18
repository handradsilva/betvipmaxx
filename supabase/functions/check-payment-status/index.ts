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
      Deno.env.get("SUPABASE_ANON_KEY")!,
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("id, status, user_id")
      .eq("gateway_ref", gateway_ref)
      .eq("user_id", userId)
      .single();

    if (txError || !tx) {
      return new Response(JSON.stringify({ error: "Transação não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If already completed/failed, return immediately
    if (tx.status !== "pending") {
      return new Response(JSON.stringify({ status: tx.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transaction still pending — actively check BS Pay API
    try {
      const clientId = Deno.env.get("BSPAY_CLIENT_ID")!;
      const clientSecret = Deno.env.get("BSPAY_CLIENT_SECRET")!;
      const credentials = btoa(`${clientId}:${clientSecret}`);

      const tokenRes = await fetch("https://api.bspay.co/v2/oauth/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "accept": "application/json",
        },
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Use BS Pay consult-transaction endpoint
        const consultRes = await fetch("https://api.bspay.co/v2/consult-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "accept": "application/json",
          },
          body: JSON.stringify({ pix_id: gateway_ref }),
        });

        if (consultRes.ok) {
          const consultData = await consultRes.json();
          console.log("BS Pay consult response:", JSON.stringify(consultData));

          const bspayStatus = (consultData.requestBody?.status || consultData.status || "").toLowerCase();
          if (bspayStatus === "paid" || bspayStatus === "completed" || bspayStatus === "approved" || bspayStatus === "confirmed") {
            // Update transaction — trigger will credit balance
            const { error: updateError } = await supabase
              .from("transactions")
              .update({ status: "completed" })
              .eq("id", tx.id)
              .eq("status", "pending");

            if (updateError) {
              console.error("Transaction update error:", updateError);
            } else {
              console.log(`Transaction ${tx.id} marked completed via polling`);
            }

            return new Response(JSON.stringify({ status: "completed" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          const errText = await consultRes.text();
          console.error("BS Pay consult error:", errText);
        }
      } else {
        console.error("BS Pay token error:", await tokenRes.text());
      }
    } catch (bspayErr) {
      console.error("BS Pay check error:", bspayErr);
    }

    // Still pending
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
