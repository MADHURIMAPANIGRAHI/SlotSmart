import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function POST(request) {
  try {
    // Read session from cookies (SERVER SIDE)
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 }
      );
    }

    //  Read frontend JSON
    const body = await request.json();

    // Forward request to FastAPI with session cookie
    const response = await fetch(
      "http://127.0.0.1:8000/generate_timetable",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { success: false, message: err.detail || "Backend error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("POST generate_data error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* -------------------- GET: dropdown / slot data -------------------- */
export async function GET() {
  try {
    // Read session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 }
      );
    }

    // 2️⃣ Forward GET request with session
    const response = await fetch(
      "http://127.0.0.1:8000/generate_data",
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
    console.error("GET generate_data error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
