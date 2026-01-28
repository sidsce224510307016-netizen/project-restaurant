import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { tableNumber } = req.body;

  const { data: table } = await supabase
    .from("tables")
    .select("*")
    .eq("number", tableNumber)
    .single();

  if (!table || table.occupied) {
    return res.json({ error: "Table not available" });
  }

  const { data: queue } = await supabase
    .from("queue")
    .select("*")
    .order("created_at");

  let selected = queue.find(q => q.people === table.capacity);
  if (!selected) selected = queue.find(q => q.people < table.capacity);

  if (!selected) {
    return res.json({ error: "No suitable party" });
  }

  await supabase.from("tables")
    .update({ occupied: true })
    .eq("number", table.number);

  await supabase.from("orders").insert({
    name: selected.name,
    items: selected.items,
    people: selected.people,
    table_number: table.number,
    status: "COOKING"
  });

  await supabase.from("queue").delete().eq("id", selected.id);

  res.json({ success: true });
}
