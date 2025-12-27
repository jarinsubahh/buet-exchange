// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// export const supabase = createClient(
//   supabaseUrl,
//   supabaseAnonKey
// );
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);