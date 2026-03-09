import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/utils/rate-limit";

// Rate limit: 10 requests per 60s for auth/admin API, 30 per 60s for other API routes
const AUTH_RATE_LIMIT = { max: 10, windowMs: 60_000 };
const API_RATE_LIMIT = { max: 30, windowMs: 60_000 };

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Apply rate limiting to API and auth-sensitive routes
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthAction = pathname === "/callback" || pathname === "/set-password";
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (isAdminApi || isAuthAction) {
    const result = rateLimit(`${ip}:auth`, AUTH_RATE_LIMIT.max, AUTH_RATE_LIMIT.windowMs);
    if (result.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
      );
    }
  } else if (isApiRoute) {
    const result = rateLimit(`${ip}:api`, API_RATE_LIMIT.max, API_RATE_LIMIT.windowMs);
    if (result.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
      );
    }
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/set-password") ||
    pathname.startsWith("/callback");

  // Redirect unauthenticated users to login (except auth pages)
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const needsOnboarding = user.user_metadata?.onboarding_completed === false;

    if (needsOnboarding) {
      // Allow access to onboarding-related pages only
      const isOnboardingPage =
        pathname.startsWith("/set-password") ||
        pathname.startsWith("/callback");

      if (!isOnboardingPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/set-password";
        return NextResponse.redirect(url);
      }
    } else if (isAuthPage && !pathname.startsWith("/callback")) {
      // Onboarded users should not access login/set-password pages
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Admin route guard
  if (pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
