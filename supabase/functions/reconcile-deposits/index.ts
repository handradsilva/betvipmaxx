import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAID = ["1", "paid", "completed", "approved", "confirmed", "cashin.confirmed"];
const FAILED = ["expired", "cancelled", "refused", "refunded", "cashin.expired", "cashin.refunded"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("RECONCILE_CRON_SECRET") ?? "";
    const providedCronSecret = req.headers.get("x-cron-secret") ?? "";
    // Automated (cron) invocations authenticate with the shared cron secret.
    const isCron = !!cronSecret && providedCronSecret === cronSecret;

    const authHeader = req.headers.get("Authorization");
    if (!isCron && !authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = (authHeader ?? "").replace("Bearer ", "");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

    const isServiceRole = isCron || token === serviceRoleKey;


    if (!isServiceRole) {
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = claimsData.claims.sub as string;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }


    const body = await req.json().catch(() => ({}));
    const days = Math.min(Math.max(Number(body?.days) || 7, 1), 60);
    const limit = Math.min(Math.max(Number(body?.limit) || 300, 1), 1000);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: pending, error: pendingError } = await supabase
      .from("transactions")
      .select("id, gateway_ref, amount, created_at")
      .eq("type", "deposit")
      .eq("status", "pending")
      .gte("created_at", since)
      .not("gateway_ref", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (pendingError) throw pendingError;

    const clientId = Deno.env.get("BSPAY_CLIENT_ID")!;
    const clientSecret = Deno.env.get("BSPAY_CLIENT_SECRET")!;
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch("https://api.bspay.co/v2/oauth/token", {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, accept: "application/json" },
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      console.error("BS Pay token error:", t);
      return new Response(
        JSON.stringify({ error: "Não foi possível autenticar no provedor de pagamento." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const accessToken = (await tokenRes.json()).access_token;

    let confirmed = 0;
    let confirmedAmount = 0;
    let expired = 0;
    let stillPending = 0;
    let errors = 0;

    for (const tx of pending ?? []) {
      try {
        const consultRes = await fetch("https://api.bspay.co/v2/consult-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            accept: "application/json",
          },
          body: JSON.stringify({ pix_id: tx.gateway_ref }),
        });

        if (!consultRes.ok) {
          errors++;
          continue;
        }

        const consultData = await consultRes.json();
        const payload = consultData.data || consultData.requestBody || consultData;
        const status = String(payload.status_label ?? payload.status ?? "").toLowerCase();

        if (PAID.includes(status)) {
          const { error } = await supabase
            .from("transactions")
            .update({ status: "completed" })
            .eq("id", tx.id)
            .eq("status", "pending");
          if (error) {
            errors++;
          } else {
            confirmed++;
            confirmedAmount += Number(tx.amount);
          }
        } else if (FAILED.includes(status)) {
          await supabase
            .from("transactions")
            .update({ status: "failed" })
            .eq("id", tx.id)
            .eq("status", "pending");
          expired++;
        } else {
          stillPending++;
        }
      } catch (e) {
        console.error("reconcile error for", tx.gateway_ref, e);
        errors++;
      }
    }

    const result = {
      checked: pending?.length ?? 0,
      confirmed,
      confirmed_amount: Number(confirmedAmount.toFixed(2)),
      expired,
      still_pending: stillPending,
      errors,
    };
    console.log("reconcile-deposits result:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("reconcile-deposits error:", err);
    const message = err instanceof Error ? err.message : "Erro interno na reconciliação";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
