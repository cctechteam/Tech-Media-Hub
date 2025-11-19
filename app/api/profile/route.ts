import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDatabase } from "@/lib/database";
import { getMemberRoles } from "@/lib/role-db-helpers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
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


    const user = db.prepare(`
      SELECT id, full_name, email, form_class, created_at
      FROM members
      WHERE id = ?
    `).get(session.userId) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const roles = await getMemberRoles(user.id);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        roles: roles.map((r: any) => r.role_name),
        roleDetails: roles
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
