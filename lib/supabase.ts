import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "setup-required";

// Placeholder values let the portfolio preview render before Supabase is configured.
// Configure the real public URL and anon/publishable key before using /admin.
export const supabase = createClient(url, anonKey);
