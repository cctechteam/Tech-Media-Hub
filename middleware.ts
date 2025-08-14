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
    if (!session && url.pathname.startsWith('/dashboard')) {
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (url.pathname.startsWith('/dashboard/admin')) {
        const { data: profile } = await supabase
            .from('members')
            .select('role')
            .eq('id', session?.user.id)
            .single();

        if (profile?.role !== 'admin') {
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [],
};