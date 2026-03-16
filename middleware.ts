import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Simplified in-memory rate limiter for local development
// In production, this would use Redis for persistence across instances
const localStore = new Map<string, { count: number; timestamp: number }>();
const LOCAL_WINDOW_MS = 10000; // 10 seconds
const LOCAL_MAX_REQUESTS = 20;  // 20 requests per window

function localRateLimit(ip: string) {
  const now = Date.now();
  const userData = localStore.get(ip);

  if (!userData || (now - userData.timestamp) > LOCAL_WINDOW_MS) {
    localStore.set(ip, { count: 1, timestamp: now });
    return { success: true, remaining: LOCAL_MAX_REQUESTS - 1 };
  }

  if (userData.count >= LOCAL_MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  userData.count += 1;
  return { success: true, remaining: LOCAL_MAX_REQUESTS - userData.count };
}

// Initialize Upstash Rate Limiter if environment variables are available
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/biztrack',
  });
}

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to /api routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : (request as any).ip || '127.0.0.1';
    let success = true;

    if (ratelimit) {
      const result = await ratelimit.limit(ip);
      success = result.success;
    } else {
      // Fallback to local in-memory limiting during development
      const result = localRateLimit(ip);
      success = result.success;
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': '10' }
        }
      );
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/api/:path*',
};
