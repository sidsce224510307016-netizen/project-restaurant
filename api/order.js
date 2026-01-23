import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, items, people } = req.body;

  if (!name || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid order" });
  }

  // Store order in waiting queue
  await supabase.from("queue").insert({
    name,
    items,
    people
  });

  res.json({ success: true });
}
