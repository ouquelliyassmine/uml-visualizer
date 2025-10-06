// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const responseBody = await backendRes.text()
  const nextRes = new NextResponse(responseBody, {
    status: backendRes.status,
    headers: { 'Content-Type': 'application/json' },
  })

  // Transfert du cookie
  const setCookie = backendRes.headers.get('set-cookie')
  if (setCookie) {
    nextRes.headers.set('Set-Cookie', setCookie) // 🔐 Essentiel pour garder le JWT
  }

  return nextRes
}

