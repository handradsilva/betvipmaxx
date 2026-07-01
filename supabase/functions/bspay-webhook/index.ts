import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // BS Pay can send legacy payloads directly/requestBody or modern v2 payloads in data.
    const payload = body.data || body.requestBody || body;
    
    // Extract transaction reference and status
    const gatewayRef = body.transaction_id || payload.transaction_id || payload.transactionId || payload.id || payload.external_id || "";
    const status = payload.status_label || payload.status || payload.payment_status || body.event || "";

    if (!gatewayRef) {
      console.error("No transaction reference in webhook payload");
      return new Response(JSON.stringify({ error: "Missing transaction reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find transaction by gateway_ref
    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("gateway_ref", gatewayRef)
      .single();

    if (findError || !transaction) {
      console.error("Transaction not found:", gatewayRef, findError);
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (transaction.status !== "pending") {
      console.log("Transaction already processed:", transaction.status);
      return new Response(JSON.stringify({ message: "Already processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map BS Pay status to our status
    const normalizedStatus = String(status).toLowerCase();
    let newStatus = "pending";
    if (
      normalizedStatus === "1" ||
      normalizedStatus === "paid" ||
      normalizedStatus === "completed" ||
      normalizedStatus === "approved" ||
      normalizedStatus === "confirmed" ||
      normalizedStatus === "cashin.confirmed"
    ) {
      newStatus = "completed";
    } else if (
      normalizedStatus === "0" ||
      normalizedStatus === "failed" ||
      normalizedStatus === "cancelled" ||
      normalizedStatus === "expired" ||
      normalizedStatus === "refused" ||
      normalizedStatus === "cashin.expired" ||
      normalizedStatus === "cashin.refunded"
    ) {
      newStatus = "failed";
    }

    if (newStatus === "pending") {
      console.log("Status not actionable:", status);
      return new Response(JSON.stringify({ message: "Status noted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update transaction status - trigger handles balance update
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Transaction ${transaction.id} updated to ${newStatus}`);
    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
