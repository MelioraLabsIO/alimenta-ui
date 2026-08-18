import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routes, sanitizeNextPath } from "@/lib/routes";

const PUBLIC_ROUTE_PREFIXES = ["/auth", "/login", "/marketing", "/reset-password"];

export function isPublicRoute(pathname: string) {
    if (PUBLIC_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
        return true;
    }

    return /^\/spin\/[^/]+$/.test(pathname);
}

export function isProtectedRoute(pathname: string) {
    return !isPublicRoute(pathname);
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;
    const protectedRoute = isProtectedRoute(pathname);

    if (!user && protectedRoute) {
        return NextResponse.redirect(new URL(routes.login(), request.nextUrl.origin));
    }

    if (user && pathname.startsWith("/login")) {
        const nextParam = request.nextUrl.searchParams.get("next");
        return NextResponse.redirect(
            new URL(sanitizeNextPath(nextParam), request.nextUrl.origin)
        );
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally: return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
