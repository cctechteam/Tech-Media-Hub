// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './lib/database';

export async function middleware(req: NextRequest) {
    // Get current session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const url = req.nextUrl;

    // Redirect unauthenticated users to login
    if (!session?.user) {
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        '/dashboard/:path*'
    ],
};