

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ✅ await cookies()
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 }
      );
    }

    const response = await fetch(
      "http://127.0.0.1:8000/generate_dashboard_data",
      {
        method: "GET",
        headers: {
          cookie: `session_id=${sessionId}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { success: false, message: err.detail || "Unauthorized" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Backend error" },
      { status: 500 }
    );
  }
}
