import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const backendRes = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.detail || "Login failed" },
        { status: backendRes.status }
      );
    }

    // 🔥 FORWARD COOKIE TO BROWSER
    const response = NextResponse.json(data);
    const setCookie = backendRes.headers.get("set-cookie");

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;

  } catch (error) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
