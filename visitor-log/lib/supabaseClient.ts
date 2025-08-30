import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // from Supabase project settings
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!   // anon key (safe for frontend)
);
