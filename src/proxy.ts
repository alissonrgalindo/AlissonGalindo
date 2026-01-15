import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { defaultLocale, locales, isValidLocale } from './i18n/config';

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const headers = { 'accept-language': acceptLanguage };
  
  try {
    const languages = new Negotiator({ headers }).languages();
    return match(languages, locales, defaultLocale);
  } catch (error) {
    console.error('Error detecting language, using default:', error);
    return defaultLocale;
  }
}


function pathnameHasValidLocale(pathname: string): boolean {
  const segments = pathname.split('/');
  return segments.length > 1 && isValidLocale(segments[1]);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  ) {
    return;
  }
  
  if (pathnameHasValidLocale(pathname)) {
    return;
  }

  const locale = getLocale(request);
  
  const newUrl = new URL(
    `/${locale}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, 
    request.url
  );
  
  const response = NextResponse.redirect(newUrl);
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)']
};