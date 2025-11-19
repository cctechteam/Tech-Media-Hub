import { NextRequest, NextResponse } from "next/server";
import { getAllMembersWithRoles } from "@/lib/role-db-helpers";

export async function GET(request: NextRequest) {
  try {
    const users = await getAllMembersWithRoles();

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
