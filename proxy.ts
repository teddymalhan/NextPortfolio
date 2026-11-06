import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect()
  }

  if (req.nextUrl.pathname === '/Teddy_Malhan_Resume.pdf') {
    const rewriteUrl = new URL('/api/resume/file', req.url)
    rewriteUrl.search = req.nextUrl.search
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin(.*)',
    '/api(.*)',
    '/Teddy_Malhan_Resume.pdf',
  ],
}
