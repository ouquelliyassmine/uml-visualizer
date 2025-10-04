
//app/api/tickets/route.ts

import { NextRequest, NextResponse } from "next/server";

// GET handler for fetching tickets
export async function GET(req: NextRequest) {
  try {
    console.log("=== GET TICKETS REQUEST ===");
    
    // Get cookies from the request
    const cookieHeader = req.headers.get("cookie") || "";
    
    console.log("🍪 Cookie header:", cookieHeader);
    
    if (!cookieHeader) {
      console.error("❌ No cookies found in request!");
      return NextResponse.json(
        { error: "Authentication required - no cookies found" },
        { status: 401 }
      );
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";
    const apiUrl = `${backendUrl}/tickets`;
    
    console.log(`📍 Calling backend: ${apiUrl}`);
    
    const backendRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "User-Agent": req.headers.get("user-agent") || "NextJS-App",
        "Accept": "application/json",
      },
    });
    
    const responseBody = await backendRes.text();
    
    console.log("=== BACKEND GET RESPONSE ===");
    console.log("📊 Status:", backendRes.status);
    console.log("📄 Response:", responseBody);
    console.log("============================");
    
    // Handle different response types
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
    });
    
    // Forward any set-cookie headers from backend
    const setCookieHeaders = backendRes.headers.get("set-cookie");
    if (setCookieHeaders) {
      responseHeaders.set("set-cookie", setCookieHeaders);
    }
    
    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ GET API route error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST handler for creating tickets (your existing code)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 🔍 Enhanced cookie debugging
    const cookieHeader = req.headers.get("cookie") || "";
    const allHeaders = Object.fromEntries(req.headers.entries());
    
    console.log("=== COOKIE DEBUG INFO ===");
    console.log("🍪 Raw cookie header:", cookieHeader);
    console.log("📋 All request headers:", allHeaders);
    console.log("🔗 Request URL:", req.url);
    console.log("🎯 Request method:", req.method);
    console.log("📦 Request body:", body);
    console.log("========================");
    
    // Check if we have any authentication cookies
    if (!cookieHeader) {
      console.error("❌ No cookies found in request!");
      return NextResponse.json(
        { error: "Authentication required - no cookies found" },
        { status: 401 }
      );
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api/utilisateur";
    
    const backendRes = await fetch(`${backendUrl}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        // Add additional headers that might be needed
        "User-Agent": req.headers.get("user-agent") || "NextJS-App",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const responseBody = await backendRes.text();
    
    console.log("=== BACKEND RESPONSE ===");
    console.log("📊 Status:", backendRes.status);
    console.log("📄 Response:", responseBody);
    console.log("🍪 Response cookies:", backendRes.headers.get("set-cookie"));
    console.log("=======================");
    
    // Handle different response types
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
    });
    
    // Forward any set-cookie headers from backend
    const setCookieHeaders = backendRes.headers.get("set-cookie");
    if (setCookieHeaders) {
      responseHeaders.set("set-cookie", setCookieHeaders);
    }
    
    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ API route error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}