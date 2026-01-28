import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { orderId, tableNumber } = req.body;

  await supabase.from("orders")
    .update({ status: "DONE" })
    .eq("id", orderId);

  await supabase.from("tables")
    .update({ occupied: false })
    .eq("number", tableNumber);

  res.json({ success: true });
}
