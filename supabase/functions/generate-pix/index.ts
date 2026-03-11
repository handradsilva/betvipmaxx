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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    const { amount, wantBonus } = await req.json();
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Valor inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile for payer info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, cpf")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BS Pay auth - get token
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

    // Generate PIX QR Code - amount in centavos (integer)
    // Generate PIX QR Code - amount as float (reais)
    const pixBody: Record<string, unknown> = {
      amount: Number(amount),
      postbackUrl: `${Deno.env.get("SUPABASE_URL")!}/functions/v1/bspay-webhook`,
    };

    // Only add optional fields if they have valid values
    pixBody.external_id = crypto.randomUUID();
    pixBody.payerQuestion = `Depósito PIX - R$ ${Number(amount).toFixed(2)}`;

    const cpf = (profile.cpf || "").replace(/\D/g, "");
    if (cpf.length === 11) {
      pixBody.payer = {
        name: profile.email.split("@")[0],
        document: cpf,
        email: profile.email,
      };
    }

    console.log("BS Pay PIX request body:", JSON.stringify(pixBody));

    const pixRes = await fetch("https://api.bspay.co/v2/pix/qrcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(pixBody),
    });

    if (!pixRes.ok) {
      const errText = await pixRes.text();
      console.error("BS Pay PIX error:", errText);
      return new Response(JSON.stringify({ error: "Erro ao gerar QR Code PIX" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pixData = await pixRes.json();
    console.log("BS Pay PIX response:", JSON.stringify(pixData));

    // Save transaction
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount,
      status: "pending",
      brcode: pixData.qrcode || "",
      qrcode_image: "",
      gateway_ref: pixData.transactionId || "",
    });

    if (txError) {
      console.error("Transaction insert error:", txError);
    }

    return new Response(
      JSON.stringify({
        qrcode_image: "",
        brcode: pixData.qrcode || "",
        transaction_id: pixData.transactionId || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-pix error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
