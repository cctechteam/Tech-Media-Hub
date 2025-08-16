"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function deleteUser(id: any) {
    await supabaseAdmin.auth.admin.deleteUser(id);
    await supabaseAdmin
        .from("members")
        .delete()
        .eq("id", id);
}