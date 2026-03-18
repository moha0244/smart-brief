// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// On crée ce client uniquement pour les opérations serveur sécurisées
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
