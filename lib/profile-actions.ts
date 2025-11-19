"use server";

import { getDatabase } from "./database";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function updateProfile(userId: number, fullName: string, formClass: string | null) {
  try {
    if (!fullName || fullName.trim() === "") {
      return { success: false, error: "Full name is required" };
    }

    const db = await getDatabase();
    
    db.prepare(`
      UPDATE members 
      SET full_name = ?, form_class = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(fullName.trim(), formClass || null, userId);

    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  try {
    if (!currentPassword || !newPassword) {
      return { success: false, error: "Current and new passwords are required" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }

    const db = await getDatabase();
    
    const user = db.prepare(`
      SELECT id, password
      FROM members
      WHERE id = ?
    `).get(userId) as any;

    if (!user) {
      return { success: false, error: "User not found" };
    }


    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    db.prepare(`
      UPDATE members 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newPasswordHash, user.id);

    return { success: true, message: "Password changed successfully" };
  } catch (error: any) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
