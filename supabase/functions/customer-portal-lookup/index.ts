// Public edge function: looks up a customer's orders by exact name + phone.
// Uses service role to avoid exposing the orders/garments tables via anon SELECT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, phone } = await req.json();
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";

    if (!cleanName || !cleanPhone) {
      return new Response(JSON.stringify({ error: "Name and phone are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: matches, error: matchErr } = await supabase
      .from("orders")
      .select("customer_id, customer_name")
      .ilike("customer_name", cleanName)
      .eq("customer_phone", cleanPhone)
      .limit(1);

    if (matchErr) throw matchErr;
    if (!matches || matches.length === 0) {
      return new Response(JSON.stringify({ orders: [], garments: [], customerName: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = matches[0].customer_id;
    const customerName = matches[0].customer_name;

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (ordersErr) throw ordersErr;

    const orderIds = (orders || []).map((o) => o.id);
    const { data: garments, error: garmentsErr } = orderIds.length
      ? await supabase.from("garments").select("*").in("order_id", orderIds)
      : { data: [], error: null };
    if (garmentsErr) throw garmentsErr;

    return new Response(
      JSON.stringify({ orders: orders || [], garments: garments || [], customerName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("customer-portal-lookup error", e);
    return new Response(JSON.stringify({ error: "Lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
