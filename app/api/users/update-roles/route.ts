import { NextRequest, NextResponse } from "next/server";
import { setMemberRoles, getMemberRoles } from "@/lib/role-db-helpers";
import { getDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { userId, roles } = await request.json();

    if (!userId || !roles || !Array.isArray(roles)) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const result = await setMemberRoles(userId, roles);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = db.prepare(`
      SELECT id, full_name, email, form_class
      FROM members
      WHERE id = ?
    `).get(userId) as any;

    const userRoles = await getMemberRoles(userId);

    return NextResponse.json({
      success: true,
      message: "Roles updated successfully",
      user: {
        ...user,
        roles: userRoles.map((r: any) => r.role_name),
        roleDetails: userRoles
      }
    });
  } catch (error) {
    console.error("Error updating roles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update roles" },
      { status: 500 }
    );
  }
}
