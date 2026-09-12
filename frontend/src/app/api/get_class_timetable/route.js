import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/* ===================== POST ===================== */
export async function POST(request) {
  try {
    const data = await request.json();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 }
      );
    }

    const pythonResponse = await fetch(
      "http://127.0.0.1:8000/get_class_timetable",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json();
      return NextResponse.json(
        { success: false, message: errorData.detail || "Backend error" },
        { status: pythonResponse.status }
      );
    }

    const timetableData = await pythonResponse.json();
    return NextResponse.json({ success: true, data: timetableData });

  } catch (error) {
    console.error("POST Route Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* ===================== GET ===================== */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 }
      );
    }

    const response = await fetch(
      "http://127.0.0.1:8000/generate_student_data",
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

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("GET Route Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
