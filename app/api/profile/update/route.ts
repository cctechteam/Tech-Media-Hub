
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { full_name, form_class } = await request.json();

    if (!full_name || full_name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const session = db.prepare(`
      SELECT s.userId 
      FROM sessions s
      WHERE s.token = ?
    `).get(sessionToken) as any;

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    db.prepare(`
      UPDATE members 
      SET full_name = ?, form_class = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name.trim(), form_class || null, session.userId);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
