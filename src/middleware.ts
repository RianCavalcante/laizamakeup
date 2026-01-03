import { NextResponse, type NextRequest } from 'next/server'

// AUTENTICAÇÃO DESABILITADA TEMPORARIAMENTE
export async function middleware(request: NextRequest) {
  // Apenas deixa passar todas as requisições sem verificar login
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf)$).*)',
  ],
}
