// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './lib/database';

const protectedRoutes = ['/dashboard']
const publicRoutes = ['/auth/login', '/auth/signup', '/']

export async function middleware(req: NextRequest) {
    // Get current session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);


    if (isProtectedRoute && session?.user == null) {
        return NextResponse.redirect(new URL('/auth/login', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};