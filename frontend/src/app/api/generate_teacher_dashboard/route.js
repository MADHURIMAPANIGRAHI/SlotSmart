import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore =  await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { message: "No session" },
        { status: 401 }
      );
    }

    const response = await fetch(
      "http://127.0.0.1:8000/generate_teacher_dashboard",
      {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionId}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { message: err.detail || "Unauthorized" },
        { status: response.status }
      );
    }

    const backendData = await response.json();

    // 🔥 FLATTEN RESPONSE
    return NextResponse.json(backendData);

  } catch (error) {
    console.error("Teacher Dashboard Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
