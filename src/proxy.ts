/* eslint-disable */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/supabase/adminAuth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Strip any client-supplied x-admin-* headers to prevent spoofing
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('x-admin-verified')
  requestHeaders.delete('x-user-id')
  requestHeaders.delete('x-user-email')

  // Check for presence of Supabase authentication cookies
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes('auth-token') || c.name.startsWith('sb-')
  )

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  // Fast-path 1: Public non-admin routes without auth cookies don't need blocking auth network calls
  if (!isAdminRoute && !hasAuthCookie) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Fast-path 2: Unauthenticated user trying to access protected /admin route without cookies
  if (isAdminRoute && !isLoginPage && !hasAuthCookie) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Supabase SSR Client for session refresh and verification
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const cookiesToSetList: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSetList.push(...cookiesToSet)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  // Handle /admin/login when already authenticated as admin
  if (isLoginPage) {
    if (user && !error && isAdminEmail(user.email)) {
      const adminUrl = new URL('/admin', request.url)
      const redirectResponse = NextResponse.redirect(adminUrl)
      cookiesToSetList.forEach(({ name, value, options }) =>
        redirectResponse.cookies.set(name, value, options)
      )
      return redirectResponse
    }
    return supabaseResponse
  }

  // Handle protected /admin/* routes
  if (isAdminRoute) {
    // If auth error, missing user, or not authorized admin email, redirect to login
    if (error || !user || !isAdminEmail(user.email)) {
      const loginUrl = new URL('/admin/login', request.url)
      const redirectResponse = NextResponse.redirect(loginUrl)
      cookiesToSetList.forEach(({ name, value, options }) =>
        redirectResponse.cookies.set(name, value, options)
      )
      return redirectResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image/font extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$).*)',
  ],
}
