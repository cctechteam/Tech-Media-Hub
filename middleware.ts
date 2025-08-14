// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "./lib/database";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Get session from cookies
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const url = req.nextUrl.clone();

    // Redirect unauthenticated users to login
    if (!session && url.pathname.startsWith("/dashboard")) {
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    // Role-based route protection for admin
    if (url.pathname.startsWith("/dashboard/admin")) {
        const { data: profile, error } = await supabase
            .from("members")
            .select("role")
            .eq("id", session?.user.id)
            .single();

        if (error || profile?.role !== 4) {
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    return res;
}

export const config = {
    matcher: ["/dashboard/:path*"],
};