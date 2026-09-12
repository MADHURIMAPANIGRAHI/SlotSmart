import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    // 1. Read session cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 }
      );
    }

    // 2. Read request body
    const data = await request.json();

    // 3. Forward to FastAPI with cookie
    const pythonResponse = await fetch(
      "http://127.0.0.1:8000/add_room",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_id=${sessionId}`, // IMPORTANT
        },
        cache: "no-store",
        body: JSON.stringify(data),
      }
    );

    // 4. Handle backend errors
   if (!pythonResponse.ok) {
  const err = await pythonResponse.json();

  let message = "Unauthorized";

  if (Array.isArray(err.detail)) {
    // FastAPI validation error
    message = err.detail.map(e => e.msg).join(", ");
  } else if (typeof err.detail === "string") {
    message = err.detail;
  }

  return NextResponse.json(
    { success: false, message },
    { status: pythonResponse.status }
  );
}


    // 5. Return response
    const msg = await pythonResponse.json();
    return NextResponse.json({
      success: true,
      data: msg,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Backend error" },
      { status: 500 }
    );
  }
}
