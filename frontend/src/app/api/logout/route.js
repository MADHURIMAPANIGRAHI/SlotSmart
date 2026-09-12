import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await fetch("http://127.0.0.1:8000/logout", {
        method: "POST",
        headers: {
          cookie: `session_id=${sessionId}`,
        },
      });
    }

    // Clear cookie on frontend
    const res = NextResponse.json({ success: true });
    res.cookies.set("session_id", "", {
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
