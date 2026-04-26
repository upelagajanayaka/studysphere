import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tfncxmmhnceklmyhoejw.supabase.co";

const supabaseAnonKey =
    "sb_publishable_5oBc--Df2Q0BW_hrvDcZmw_u56xPQ6X";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);