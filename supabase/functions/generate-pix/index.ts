import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sanitizeCpf = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D/g, "").slice(0, 11) : "";

const buildPayerName = (email: string) => {
  const localPart = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return (localPart || "Cliente PIX").slice(0, 60);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readResponseBody = async (response: Response) => {
  const text = await response.text();
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
};

const extractPixResult = (payload: any) => {
  const data = payload?.data ?? payload?.requestBody ?? payload ?? {};
  const paymentInfo = data?.payment_info ?? data?.paymentInfo ?? {};

  return {
    brcode: paymentInfo?.qrcode || data?.qrcode || data?.brcode || "",
    transactionId:
      data?.transaction_id ||
      data?.transactionId ||
      payload?.transaction_id ||
      payload?.transactionId ||
      "",
  };
};

const postJsonWithRetry = async ({
  url,
  headers,
  body,
  label,
}: {
  url: string;
  headers: HeadersInit;
  body: Record<string, unknown>;
  label: string;
}) => {
  let lastStatus = 0;
  let lastText = "";
  let lastJson: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const parsed = await readResponseBody(response);
    lastStatus = response.status;
    lastText = parsed.text;
    lastJson = parsed.json;

    if (response.ok) {
      return { ok: true, status: response.status, json: parsed.json, text: parsed.text };
    }

    const retryable =
      response.status >= 500 ||
      parsed.json?.error?.retryable === true ||
      parsed.json?.error?.code === "PROVIDER_ERROR";

    console.error(
      `BS Pay ${label} error (attempt ${attempt}, status ${response.status}):`,
      parsed.text.slice(0, 300)
    );

    if (!retryable || attempt === 3) break;
    await sleep(900 * attempt);
  }

  return { ok: false, status: lastStatus, json: lastJson, text: lastText };
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

    const body = await req.json();
    const amount = Number(body?.amount);
    const providedCpf = sanitizeCpf(body?.cpf);

    if (!Number.isFinite(amount) || amount <= 0) {
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
    console.log("BS Pay token response keys:", Object.keys(tokenData).join(", "));

    const payerCpf = providedCpf || sanitizeCpf(profile.cpf);
    if (payerCpf.length !== 11) {
      return new Response(JSON.stringify({ error: "CPF válido é obrigatório para gerar o PIX" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const externalId = crypto.randomUUID();
    const postbackUrl = `${Deno.env.get("SUPABASE_URL")!}/functions/v1/bspay-webhook`;
    const payer = {
      name: buildPayerName(profile.email),
      document: payerCpf,
      email: profile.email,
    };

    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Prefer the current BS Pay cash-in endpoint. The old /pix/qrcode route is legacy
    // and can return gateway errors during provider changes.
    const modernPixBody: Record<string, unknown> = {
      amount: Number(amount.toFixed(2)),
      currency: "BRL",
      external_id: externalId,
      payer,
      postback_url: postbackUrl,
    };

    console.log("BS Pay PIX request:", JSON.stringify({ endpoint: "cashin", amount: modernPixBody.amount }));

    let pixResult = await postJsonWithRetry({
      url: "https://api.bspay.co/v2/transactions/cashin",
      headers,
      body: modernPixBody,
      label: "cashin",
    });

    let parsedPix = pixResult.ok ? extractPixResult(pixResult.json) : { brcode: "", transactionId: "" };

    if (!parsedPix.brcode) {
      const legacyPixBody: Record<string, unknown> = {
        amount: Number(amount.toFixed(2)),
        external_id: externalId,
        payer,
        description: `Depósito PIX - R$ ${Number(amount).toFixed(2)}`,
        payerQuestion: `Depósito PIX - R$ ${Number(amount).toFixed(2)}`,
        postbackUrl,
      };

      console.log("BS Pay PIX fallback request:", JSON.stringify({ endpoint: "pix/qrcode", amount: legacyPixBody.amount }));
      pixResult = await postJsonWithRetry({
        url: "https://api.bspay.co/v2/pix/qrcode",
        headers,
        body: legacyPixBody,
        label: "pix/qrcode",
      });
      parsedPix = pixResult.ok ? extractPixResult(pixResult.json) : { brcode: "", transactionId: "" };
    }

    if (!pixResult.ok || !parsedPix.brcode) {
      const upstreamMessage =
        pixResult.json?.error?.message ||
        pixResult.json?.message ||
        "O provedor de pagamento está temporariamente indisponível. Tente novamente em instantes.";

      return new Response(
        JSON.stringify({
          error: pixResult.status >= 500 ? upstreamMessage : "Erro ao gerar QR Code PIX",
        }),
        { status: pixResult.status >= 500 ? 503 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("BS Pay PIX generated:", JSON.stringify({ transactionId: parsedPix.transactionId, hasQrCode: true }));

    // Save transaction
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount,
      status: "pending",
      brcode: parsedPix.brcode,
      qrcode_image: "",
      gateway_ref: parsedPix.transactionId || externalId,
    });

    if (txError) {
      console.error("Transaction insert error:", txError);
    }

    return new Response(
      JSON.stringify({
        qrcode_image: "",
        brcode: parsedPix.brcode,
        transaction_id: parsedPix.transactionId || externalId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-pix error:", err);
    const message = err instanceof Error ? err.message : "Erro interno ao gerar PIX";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
